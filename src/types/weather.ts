export interface DistrictWeather {
  districtName: string;
  districtNameOr: string;
  temperatureC: number;
  humidityPercent: number;
  rainfallMm24h: number;
  cloudCoverPercent: number;
  windSpeedKmh: number;
  forecastSummary: string;
  bphRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  stemBorerRiskLevel: 'Low' | 'Moderate' | 'High';
  hispaRiskLevel: 'Low' | 'Moderate' | 'High';
  riskRationaleEn: string;
  riskRationaleOr: string;
  recordedAt: string;
}

export interface DistrictPestSummary {
  districtId: string;
  districtName: string;
  districtNameOr: string;
  zone: string;
  totalFarmerScans: number;
  aiSuspectedCases: number;
  expertConfirmedCases: number;
  activeOutbreakAlert: boolean;
  dominantPestId?: string;
  kvkName: string;
  kvkPhone: string;
}
