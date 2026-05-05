"""
Incentive Operations Monitoring Dashboard - Main Streamlit App
Track incentive payouts, detect errors, and ensure operational efficiency
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os

# Import modules
from src.data_generator import load_from_database, generate_sample_data, save_to_database
from src.validator import PayoutValidator, get_error_summary
from src.kpi_tracker import KPITracker
from src.reporter import ReportGenerator, export_errors_by_category
from src.database import DatabaseManager

# Page configuration
st.set_page_config(
    page_title="Incentive Operations Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        margin: 10px 0;
    }
    .error-high {
        background-color: #ffcccc;
        padding: 10px;
        border-radius: 5px;
    }
    .error-medium {
        background-color: #ffe6cc;
        padding: 10px;
        border-radius: 5px;
    }
    .error-low {
        background-color: #ffffcc;
        padding: 10px;
        border-radius: 5px;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'data_loaded' not in st.session_state:
    st.session_state.data_loaded = False
if 'df' not in st.session_state:
    st.session_state.df = None
if 'errors_df' not in st.session_state:
    st.session_state.errors_df = None
if 'kpis' not in st.session_state:
    st.session_state.kpis = None

# Header
st.markdown("# 📊 Incentive Operations Monitoring Dashboard")
st.markdown("**Real-time tracking and error detection for incentive payouts**")
st.divider()

# Sidebar
with st.sidebar:
    st.markdown("## 🎛️ Dashboard Controls")
    
    # Data Management
    st.markdown("### Data Management")
    if st.button("🔄 Generate Sample Data", use_container_width=True):
        with st.spinner("Generating sample data..."):
            df = generate_sample_data(num_records=500)
            save_to_database(df)
            st.session_state.df = df
            st.session_state.data_loaded = True
            st.success("✓ Sample data generated successfully!")
            st.rerun()
    
    if st.button("📥 Load Data from Database", use_container_width=True):
        try:
            df = load_from_database()
            st.session_state.df = df
            st.session_state.data_loaded = True
            st.success(f"✓ Loaded {len(df)} records from database")
            st.rerun()
        except Exception as e:
            st.error(f"Error loading data: {e}")
    
    st.divider()
    
    # Page navigation
    st.markdown("### Navigation")
    page = st.radio(
        "Select View",
        ["📌 Dashboard", "🚨 Error Detection", "📈 KPI Analytics", "👥 Employee Drill-Down", "📤 Reports", "⚙️ Settings"]
    )
    
    st.divider()
    st.markdown("### About")
    st.info("""
    **Incentive Operations Dashboard**
    
    Track SLA breaches, error rates, and regional performance in real-time.
    
    Features:
    - ⏱️ SLA Tracking
    - 🚨 Error Classification
    - 📊 KPI Metrics
    - 🔍 Drill-down Analysis
    - 📤 Automated Reports
    """)

# Main content
if not st.session_state.data_loaded:
    st.warning("⚠️ Please load or generate data to begin")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Generate Sample Data Now", use_container_width=True):
            with st.spinner("Generating..."):
                df = generate_sample_data()
                save_to_database(df)
                st.session_state.df = df
                st.session_state.data_loaded = True
                st.rerun()
    with col2:
        if st.button("Load Existing Data", use_container_width=True):
            try:
                df = load_from_database()
                st.session_state.df = df
                st.session_state.data_loaded = True
                st.rerun()
            except Exception as e:
                st.error(f"Error: {e}")
else:
    df = st.session_state.df
    
    # Run validation if not done yet
    if st.session_state.errors_df is None:
        validator = PayoutValidator(df)
        errors_df = validator.validate_payouts()
        st.session_state.errors_df = errors_df
    
    if st.session_state.kpis is None:
        tracker = KPITracker(df)
        kpis = tracker.get_overall_kpis()
        st.session_state.kpis = kpis
    
    errors_df = st.session_state.errors_df
    kpis = st.session_state.kpis
    
    # ============ DASHBOARD PAGE ============
    if page == "📌 Dashboard":
        st.markdown("## 📊 Executive Dashboard")
        
        # KPI Cards
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                "Total Payouts",
                f"${kpis['total_amount_processed']:,.0f}",
                f"{kpis['total_payouts_processed']} processed"
            )
        
        with col2:
            error_color = "🔴" if kpis['error_rate_percent'] > 5 else "🟢"
            st.metric(
                f"{error_color} Error Rate",
                f"{kpis['error_rate_percent']:.2f}%",
                f"{kpis['error_records']} errors"
            )
        
        with col3:
            st.metric(
                "Processing Time",
                f"{kpis['avg_processing_time_hours']:.1f}h",
                "Average per payout"
            )
        
        with col4:
            st.metric(
                "Pending",
                kpis['pending_payouts'],
                "Awaiting processing"
            )
        
        st.divider()
        
        # Performance Metrics
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("### ✅ Incorrect Payout Rate")
            st.progress(
                kpis['incorrect_payout_rate_percent'] / 100,
                text=f"{kpis['incorrect_payout_rate_percent']:.2f}%"
            )
        
        with col2:
            st.markdown("### ⏱️ Delayed Payout Rate")
            st.progress(
                kpis['delayed_payout_rate_percent'] / 100,
                text=f"{kpis['delayed_payout_rate_percent']:.2f}%"
            )
        
        with col3:
            st.markdown("### 📍 Processed Records")
            completion_rate = (kpis['total_payouts_processed'] / kpis['total_records'] * 100) if kpis['total_records'] > 0 else 0
            st.progress(
                completion_rate / 100,
                text=f"{completion_rate:.1f}%"
            )
        
        st.divider()
        
        # Regional Performance Chart
        tracker = KPITracker(df)
        regional_kpis = tracker.get_regional_kpis()
        
        if not regional_kpis.empty:
            col1, col2 = st.columns(2)
            
            with col1:
                fig = px.bar(
                    regional_kpis,
                    x='region',
                    y='total_amount',
                    color='error_rate_percent',
                    title="Region Performance - Total Payouts & Error Rate",
                    labels={'region': 'Region', 'total_amount': 'Total Amount ($)', 'error_rate_percent': 'Error %'},
                    color_continuous_scale='RdYlGn_r'
                )
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                fig = px.bar(
                    regional_kpis,
                    x='region',
                    y='avg_processing_hours',
                    title="Average Processing Time by Region",
                    labels={'region': 'Region', 'avg_processing_hours': 'Hours'}
                )
                st.plotly_chart(fig, use_container_width=True)
        
        st.divider()
        
        # Daily Trend
        daily_trend = tracker.get_daily_trend(days=30)
        if not daily_trend.empty:
            st.markdown("### 📈 Processing Time Trend (Last 30 Days)")
            fig = px.line(
                daily_trend,
                x='date',
                y='avg_processing_time',
                title="Average Processing Time Trend",
                labels={'date': 'Date', 'avg_processing_time': 'Hours'}
            )
            st.plotly_chart(fig, use_container_width=True)
    
    # ============ ERROR DETECTION PAGE ============
    elif page == "🚨 Error Detection":
        st.markdown("## 🚨 Error Detection & Classification")
        
        if errors_df.empty:
            st.success("✅ No errors detected! All payouts are valid.")
        else:
            # Error Summary
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total Errors", len(errors_df))
            
            with col2:
                high_severity = len(errors_df[errors_df['severity'] == 'HIGH'])
                st.metric("High Severity", high_severity)
            
            with col3:
                medium_severity = len(errors_df[errors_df['severity'] == 'MEDIUM'])
                st.metric("Medium Severity", medium_severity)
            
            with col4:
                error_types = errors_df['error_type'].nunique()
                st.metric("Error Types", error_types)
            
            st.divider()
            
            # Error Classification Breakdown
            col1, col2 = st.columns(2)
            
            with col1:
                fig = px.pie(
                    errors_df,
                    names='error_type',
                    title="Errors by Type",
                    values=errors_df.groupby('error_type').size()
                )
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                fig = px.pie(
                    errors_df,
                    names='severity',
                    title="Errors by Severity",
                    values=errors_df.groupby('severity').size(),
                    color='severity',
                    color_discrete_map={'HIGH': '#ff4444', 'MEDIUM': '#ffaa44', 'LOW': '#ffff44'}
                )
                st.plotly_chart(fig, use_container_width=True)
            
            st.divider()
            
            # Detailed Error Table
            st.markdown("### 📋 Detailed Error Log")
            
            # Filter options
            col1, col2, col3 = st.columns(3)
            
            with col1:
                selected_severity = st.multiselect(
                    "Filter by Severity",
                    errors_df['severity'].unique(),
                    default=errors_df['severity'].unique()
                )
            
            with col2:
                selected_type = st.multiselect(
                    "Filter by Error Type",
                    errors_df['error_type'].unique(),
                    default=errors_df['error_type'].unique()
                )
            
            with col3:
                selected_region = st.multiselect(
                    "Filter by Region",
                    errors_df['region'].unique(),
                    default=errors_df['region'].unique()
                )
            
            # Apply filters
            filtered_errors = errors_df[
                (errors_df['severity'].isin(selected_severity)) &
                (errors_df['error_type'].isin(selected_type)) &
                (errors_df['region'].isin(selected_region))
            ]
            
            display_cols = ['employee_id', 'region', 'error_type', 'error_classification', 
                          'description', 'variance_percent', 'processing_time_hours', 'severity']
            
            st.dataframe(
                filtered_errors[display_cols].sort_values('variance_percent', ascending=False),
                use_container_width=True
            )
            
            # Regional Error Distribution
            st.markdown("### 📍 Errors by Region")
            regional_errors = errors_df.groupby('region').size().reset_index(name='error_count')
            fig = px.bar(
                regional_errors,
                x='region',
                y='error_count',
                title="Error Count by Region",
                labels={'region': 'Region', 'error_count': 'Errors'}
            )
            st.plotly_chart(fig, use_container_width=True)
    
    # ============ KPI ANALYTICS PAGE ============
    elif page == "📈 KPI Analytics":
        st.markdown("## 📈 KPI & SLA Analytics")
        
        tracker = KPITracker(df)
        
        # SLA Metrics
        st.markdown("### ⏱️ SLA Tracking (3-Day Threshold)")
        sla_metrics = tracker.get_sla_metrics()
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("SLA Compliance", f"{sla_metrics['sla_compliance_rate_percent']:.1f}%")
        
        with col2:
            st.metric("SLA Breaches", sla_metrics['total_sla_breaches'])
        
        with col3:
            st.metric("On-Time Deliveries", sla_metrics['on_time_deliveries'])
        
        with col4:
            st.metric("Max Processing Time", f"{sla_metrics['max_processing_time_hours']:.1f}h")
        
        st.divider()
        
        # Regional Performance
        st.markdown("### 📍 Regional Performance Metrics")
        regional_kpis = tracker.get_regional_kpis()
        
        st.dataframe(regional_kpis, use_container_width=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            fig = px.bar(
                regional_kpis,
                x='region',
                y='error_rate_percent',
                title="Error Rate by Region",
                color='error_rate_percent',
                color_continuous_scale='Reds'
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            fig = px.bar(
                regional_kpis,
                x='region',
                y='delayed_rate_percent',
                title="Delayed Payout Rate by Region",
                color='delayed_rate_percent',
                color_continuous_scale='Oranges'
            )
            st.plotly_chart(fig, use_container_width=True)
        
        st.divider()
        
        # Processing Time Distribution
        st.markdown("### ⏳ Processing Time Distribution")
        fig = px.histogram(
            df,
            x='processing_time',
            nbins=30,
            title="Distribution of Processing Times",
            labels={'processing_time': 'Processing Time (hours)', 'count': 'Frequency'},
            color_discrete_sequence=['#0099ff']
        )
        fig.add_vline(sla_metrics['sla_threshold_hours'], line_dash="dash", line_color="red", 
                     annotation_text=f"SLA Threshold ({sla_metrics['sla_threshold_hours']}h)")
        st.plotly_chart(fig, use_container_width=True)
    
    # ============ EMPLOYEE DRILL-DOWN PAGE ============
    elif page == "👥 Employee Drill-Down":
        st.markdown("## 👥 Employee Analysis & History")
        
        tracker = KPITracker(df)
        
        # Employee selection
        employees = sorted(df['employee_id'].unique())
        selected_employee = st.selectbox("Select Employee", employees)
        
        if selected_employee:
            emp_metrics = tracker.get_employee_metrics(selected_employee)
            
            if emp_metrics:
                # Employee info
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("Total Payouts", emp_metrics['total_payouts'])
                
                with col2:
                    st.metric("Total Amount", f"${emp_metrics['total_amount']:,.2f}")
                
                with col3:
                    st.metric("Errors", emp_metrics['error_count'])
                
                with col4:
                    sla_status = "🔴 SLA Breach" if emp_metrics['has_sla_breach'] else "✅ Compliant"
                    st.metric("SLA Status", sla_status)
                
                st.markdown(f"**Region**: {emp_metrics['region']}")
                st.markdown(f"**Avg Processing Time**: {emp_metrics['avg_processing_time']:.2f} hours")
                
                st.divider()
                
                # Payout History
                st.markdown("### 📋 Payout History")
                history_df = pd.DataFrame(emp_metrics['payout_history'])
                history_df['date'] = pd.to_datetime(history_df['date'])
                history_df = history_df.sort_values('date', ascending=False)
                
                st.dataframe(history_df, use_container_width=True)
                
                # Historical Chart
                if len(history_df) > 1:
                    fig = px.line(
                        history_df.sort_values('date'),
                        x='date',
                        y='payout_amount',
                        title="Payout Amount History",
                        labels={'date': 'Date', 'payout_amount': 'Amount ($)'},
                        markers=True
                    )
                    st.plotly_chart(fig, use_container_width=True)
    
    # ============ REPORTS PAGE ============
    elif page == "📤 Reports":
        st.markdown("## 📤 Operational Reports & Exports")
        
        st.markdown("### Generate & Download Reports")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("📋 Generate Summary Report", use_container_width=True):
                with st.spinner("Generating summary report..."):
                    tracker = KPITracker(df)
                    kpis = tracker.get_overall_kpis()
                    reporter = ReportGenerator(df, errors_df, kpis)
                    
                    summary_file = reporter.generate_summary_report_text()
                    error_file = reporter.generate_error_log_csv()
                    regional_file = reporter.generate_regional_breakdown()
                    
                    st.success("✓ Reports generated successfully!")
        
        with col2:
            if st.button("🚨 Export Error Log (CSV)", use_container_width=True):
                with st.spinner("Exporting error log..."):
                    if not errors_df.empty:
                        csv = errors_df.to_csv(index=False)
                        st.download_button(
                            label="Download Error Log",
                            data=csv,
                            file_name=f"error_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                            mime="text/csv"
                        )
                    else:
                        st.info("No errors to export")
        
        with col3:
            if st.button("📊 Export All Data (CSV)", use_container_width=True):
                with st.spinner("Exporting data..."):
                    csv = df.to_csv(index=False)
                    st.download_button(
                        label="Download Full Dataset",
                        data=csv,
                        file_name=f"payouts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                        mime="text/csv"
                    )
        
        st.divider()
        
        # Executive Summary
        st.markdown("### 📊 Executive Summary")
        
        tracker = KPITracker(df)
        kpis = tracker.get_overall_kpis()
        reporter = ReportGenerator(df, errors_df, kpis)
        summary = reporter.generate_executive_summary()
        
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            st.metric("Report Date", summary['report_date'])
        
        with col2:
            st.metric("Total Errors", summary['total_errors'])
        
        with col3:
            st.metric("Critical Issues", summary['critical_issues'])
        
        with col4:
            st.metric("Error Rate", f"{summary['error_rate']:.2f}%")
        
        with col5:
            st.metric("SLA Compliance", f"{summary['sla_compliance']:.1f}%")
        
        st.divider()
        
        # Report Content
        if os.path.exists('reports/summary_report.txt'):
            with open('reports/summary_report.txt', 'r') as f:
                report_content = f.read()
                st.text(report_content)
    
    # ============ SETTINGS PAGE ============
    elif page == "⚙️ Settings":
        st.markdown("## ⚙️ Configuration & Settings")
        
        st.markdown("### Data Configuration")
        st.info(f"Database: {st.session_state.get('db_path', 'data/incentive_payouts.db')}")
        st.info(f"Records Loaded: {len(df) if df is not None else 0}")
        
        st.markdown("### SLA Configuration")
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**SLA Threshold**: 3 days (72 hours)")
        
        with col2:
            st.markdown("**Delay Threshold**: 72 hours")
        
        st.markdown("### About This Dashboard")
        st.markdown("""
        **Incentive Operations Monitoring Dashboard**
        
        This dashboard provides comprehensive monitoring and analytics for incentive payout operations.
        
        #### Key Features:
        - ✅ Real-time payout validation and error detection
        - 📊 Comprehensive KPI tracking
        - ⏱️ SLA breach monitoring
        - 🚨 Error classification system
        - 📈 Regional performance analysis
        - 👥 Employee drill-down capability
        - 📤 Automated reporting and export
        
        #### Error Classifications:
        - **DATA_ISSUE**: Data quality mismatches
        - **DELAY_ISSUE**: Processing delays and SLA breaches
        - **AMOUNT_ISSUE**: Incorrect payout amounts
        - **SYSTEM_ERROR**: System failures
        
        Version: 1.0.0
        Last Updated: 2026-05-05
        """)

# Footer
st.divider()
st.markdown("""
---
**Incentive Operations Monitoring Dashboard** | Built with Streamlit | Data-driven Operational Excellence
""")
