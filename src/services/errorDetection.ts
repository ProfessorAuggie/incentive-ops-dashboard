import { prisma } from "../lib/prisma";

export type ClassifiedError = {
  id: string;
  employee: string;
  region: string;
  type: string;
  severity: string;
  description: string;
  classification: "Data issue" | "Logic issue" | "Delay issue";
};

export async function classifyErrors(limit = 100) {
  try {
    const errors = await prisma.errorLog.findMany({ take: limit, orderBy: { createdAt: "desc" } });

    const classified: ClassifiedError[] = errors.map((e) => {
      let classification: ClassifiedError["classification"] = "Data issue";
      if (e.type.toLowerCase().includes("timeout") || e.description.toLowerCase().includes("delay")) {
        classification = "Delay issue";
      } else if (e.type.toLowerCase().includes("calc") || e.description.toLowerCase().includes("logic")) {
        classification = "Logic issue";
      }

      return {
        id: e.id,
        employee: e.employee,
        region: e.region,
        type: e.type,
        severity: e.severity,
        description: e.description,
        classification,
      };
    });

    return classified;
  } catch (err) {
    console.error("classifyErrors", err);
    return [];
  }
}
