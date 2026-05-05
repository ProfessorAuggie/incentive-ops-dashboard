from streamlit.web import cli
import sys

# This serverless handler attempts to run Streamlit in a Vercel Python function.
# Note: Vercel serverless functions are short-lived and may not support long-running
# processes or WebSockets required by Streamlit. Use this for experimentation only.

def handler(request):
    # Emulate CLI invocation used by Streamlit
    sys.argv = ["streamlit", "run", "app.py", "--server.headless", "true"]
    cli.main()
    return "OK"
