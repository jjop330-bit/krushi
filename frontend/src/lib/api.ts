const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ScanAnalysisPayload {
  file?: File;
  imageBase64?: string;
  cropId?: string;
  farmerDistrict?: string;
  forcedPestId?: string;
}

export class KrushiMitraApiClient {
  static async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Backend service unreachable");
    return res.json();
  }

  static async analyzePestPhoto(payload: ScanAnalysisPayload) {
    if (payload.file) {
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("crop_id", payload.cropId || "paddy");
      formData.append("farmer_district", payload.farmerDistrict || "bargarh");
      if (payload.forcedPestId) {
        formData.append("forced_pest_id", payload.forcedPestId);
      }

      const res = await fetch(`${API_BASE_URL}/pest/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(err.detail || "Vision analysis failed");
      }
      return res.json();
    } else if (payload.imageBase64) {
      const res = await fetch(`${API_BASE_URL}/pest/analyze-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: payload.imageBase64,
          crop_id: payload.cropId || "paddy",
          farmer_district: payload.farmerDistrict || "bargarh",
          forced_pest_id: payload.forcedPestId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(err.detail || "Vision analysis failed");
      }
      return res.json();
    } else {
      throw new Error("No image file or base64 provided");
    }
  }

  static async getPestTreatments(pestId: string) {
    const res = await fetch(`${API_BASE_URL}/treatments/${pestId}`);
    if (!res.ok) throw new Error("Could not fetch treatment recommendations");
    return res.json();
  }

  static async getDistrictsTelemetry() {
    const res = await fetch(`${API_BASE_URL}/intelligence/districts`);
    if (!res.ok) throw new Error("Could not fetch district telemetry");
    return res.json();
  }

  static async askAssistant(query: string, pestContext?: string, language: string = "or") {
    const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        pest_context: pestContext,
        language,
      }),
    });
    if (!res.ok) throw new Error("Assistant response failed");
    return res.json();
  }
}
