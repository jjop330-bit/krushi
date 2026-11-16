import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon, 
  Sliders, 
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Hash,
  Activity,
  Layers,
  FileCheck,
  ChevronDown,
  Search,
  X,
  Sprout
} from 'lucide-react';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';
import { SAMPLE_PEST_IMAGES, SamplePestImage } from '../data/sampleImages';
import { PestVisionService, ImageQualityCheck } from '../services/pestVisionService';
import { ScanReport, CropId, PlantPart } from '../types/pest';
import { SUPPORTED_CROPS, CROP_CATEGORIES, getCropById } from '../data/cropKnowledge';
import { CameraModal } from './CameraModal';

export type ScannerLifecycleState = 
  | 'IDLE' 
  | 'IMAGE_SELECTED' 
  | 'IMAGE_VALIDATED' 
  | 'ANALYZING' 
  | 'RESULT_RECEIVED';

export const PLANT_PARTS: Array<{
  id: PlantPart;
  labelEn: string;
  labelOr: string;
  icon: string;
}> = [
  { id: 'leaf', labelEn: 'Leaf / Blade', labelOr: 'ପତ୍ର (Leaf)', icon: '🍃' },
  { id: 'stem', labelEn: 'Stem / Tiller', labelOr: 'କାଣ୍ଡ / ଗଛ ମୂଳ (Stem)', icon: '🎋' },
  { id: 'root', labelEn: 'Root / Crown', labelOr: 'ଚେର (Root)', icon: '🌱' },
  { id: 'flower', labelEn: 'Flower / Bud', labelOr: 'ଫୁଲ / କଢି (Flower)', icon: '🌸' },
  { id: 'fruit', labelEn: 'Fruit / Pod', labelOr: 'ଫଳ / ଛୁଇଁ (Fruit)', icon: '🍅' },
  { id: 'grain', labelEn: 'Grain / Earhead', labelOr: 'ଶିଷା / ଦାନା (Grain)', icon: '🌾' },
  { id: 'whole_plant', labelEn: 'Whole Plant', labelOr: 'ସମ୍ପୂର୍ଣ୍ଣ ଗଛ (Whole)', icon: '🪴' }
];

const POPULAR_CROPS: CropId[] = [
  'paddy',
  'maize',
  'tomato',
  'brinjal',
  'chilli',
  'groundnut',
  'ragi',
  'cabbage'
];

interface PestScannerProps {
  lang: 'or' | 'en';
  onScanComplete: (report: ScanReport) => void;
  selectedSample?: SamplePestImage | null;
  onClearSample?: () => void;
}

export const PestScanner: React.FC<PestScannerProps> = ({
  lang,
  onScanComplete,
  selectedSample,
  onClearSample
}) => {
  const [lifecycleState, setLifecycleState] = useState<ScannerLifecycleState>('IDLE');
  const [currentSample, setCurrentSample] = useState<SamplePestImage | null>(selectedSample || null);
  const [imageUri, setImageUri] = useState<string | null>(selectedSample?.imageUri || null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropId>('paddy');
  const [selectedPlantPart, setSelectedPlantPart] = useState<PlantPart>('leaf');
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [qualityCheck, setQualityCheck] = useState<ImageQualityCheck | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = ODIA_TRANSLATIONS[lang];
  const activeCropInfo = getCropById(selectedCrop);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const filteredCrops = useMemo(() => {
    return SUPPORTED_CROPS.filter(crop => {
      const matchesCategory = selectedCategoryTab === 'all' || crop.category === selectedCategoryTab;
      const q = cropSearchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesSearch = 
        crop.commonNameEn.toLowerCase().includes(q) ||
        crop.commonNameOr.toLowerCase().includes(q) ||
        crop.scientificName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryTab, cropSearchQuery]);

  const processNewImage = useCallback(async (uri: string, sample?: SamplePestImage | null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setLifecycleState('IMAGE_SELECTED');
    setErrorMsg(null);
    setImageUri(uri);
    setCurrentSample(sample || null);

    try {
      const hash = await PestVisionService.computeImageHash(uri);
      setImageHash(hash);
      const check = await PestVisionService.assessImageQuality(uri);
      setQualityCheck(check);
      setLifecycleState('IMAGE_VALIDATED');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to inspect image quality.');
      setLifecycleState('IMAGE_SELECTED');
    }
  }, []);

  useEffect(() => {
    if (selectedSample) {
      processNewImage(selectedSample.imageUri, selectedSample);
    }
  }, [selectedSample, processNewImage]);

  const handleRawFile = async (file: File) => {
    setErrorMsg(null);

    const validation = await PestVisionService.validateImageBinary(file);
    if (!validation.isValid) {
      setErrorMsg(lang === 'or' ? validation.errorOr || 'ଅବୈଧ ଫଟୋ ଫାଇଲ୍।' : validation.errorEn || 'Invalid image file.');
      return;
    }

    if (onClearSample) onClearSample();

    try {
      const compressedUri = await PestVisionService.compressAndResizeImage(file, 1200, 0.85);
      await processNewImage(compressedUri, null);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'or' ? 'ଫଟୋ ପ୍ରକ୍ରିୟାକରଣରେ ତ୍ରୁଟି।' : 'Failed to process uploaded image.'));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleRawFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleRawFile(file);
    }
  };

  const handleSelectSample = async (sample: SamplePestImage) => {
    if (onClearSample) onClearSample();
    await processNewImage(sample.imageUri, sample);
  };

  const handleCameraCapture = async (capturedDataUrl: string) => {
    if (onClearSample) onClearSample();
    await processNewImage(capturedDataUrl, null);
  };

  const handleStartAnalysis = async () => {
    if (!imageUri) return;

    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    activeRequestIdRef.current = requestId;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLifecycleState('ANALYZING');
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      setAnalysisStep(lang === 'or' ? '୧/୪: ଫଟୋ ଗୁଣବତ୍ତା ଓ ରେଜୋଲ୍ୟୁସନ ଯାଞ୍ଚ ହେଉଛି...' : '1/4: Validating image resolution & lighting contrast...');
      await new Promise(r => setTimeout(r, 350));

      if (controller.signal.aborted) return;

      setAnalysisStep(lang === 'or' ? `୨/୪: ${activeCropInfo?.commonNameOr || 'ଫସଲ'}ର ${selectedPlantPart}ରେ କୀଟ ବା ରୋଗ ଲକ୍ଷଣ ଅନୁସନ୍ଧାନ ହେଉଛି...` : `2/4: Analyzing insect morphology on ${activeCropInfo?.commonNameEn || 'crop'} ${selectedPlantPart}...`);
      await new Promise(r => setTimeout(r, 400));

      if (controller.signal.aborted) return;

      setAnalysisStep(lang === 'or' ? '୩/୪: ICAR, OUAT ଓ ଓଡ଼ିଶା କୃଷି ଡାଟାବେସ୍ ସହିତ ମେଳ କରାଯାଉଛି...' : '3/4: Cross-referencing ICAR, OUAT & Odisha crop knowledge registry...');
      await new Promise(r => setTimeout(r, 350));

      if (controller.signal.aborted) return;

      setAnalysisStep(lang === 'or' ? '୪/୪: ଜୈବିକ ଓ ରାସାୟନିକ ଉପଚାର ପରାମର୍ଶ ପ୍ରସ୍ତୁତ ହେଉଛି...' : '4/4: Formulating 3-tier IPM recommendations & safety checks...');
      await new Promise(r => setTimeout(r, 300));

      if (controller.signal.aborted) return;

      const report = await PestVisionService.analyzeCropImage(
        imageUri,
        selectedCrop,
        selectedPlantPart,
        currentSample?.pestId,
        'bargarh',
        requestId,
        controller.signal
      );

      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      setLifecycleState('RESULT_RECEIVED');
      setIsAnalyzing(false);
      onScanComplete(report);
    } catch (err: any) {
      if (activeRequestIdRef.current !== requestId) return;
      setIsAnalyzing(false);
      setLifecycleState('IMAGE_VALIDATED');
      setErrorMsg(err.message || (lang === 'or' ? 'ବିଶ୍ଳେଷଣ ବିଫଳ ହେଲା। ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Diagnostic analysis failed. Please try again.'));
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    activeRequestIdRef.current = null;
    setLifecycleState('IDLE');
    setImageUri(null);
    setImageHash(null);
    setCurrentSample(null);
    setQualityCheck(null);
    setErrorMsg(null);
    setIsAnalyzing(false);
    if (onClearSample) onClearSample();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wide">
                {lang === 'or' ? 'ସାର୍ବଜନୀନ ଫସଲ AI ସ୍କାନର' : 'Universal Crop AI Scanner'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {lang === 'or' ? 'ଓଡ଼ିଶା କୃଷି ସଂସ୍କରଣ' : 'Odisha Agro Edition'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ଫସଲ ଫଟୋ ଉଠାନ୍ତୁ ବା ଅପଲୋଡ୍ କରନ୍ତୁ' : 'Photograph or Upload Crop Pest'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? 'ପ୍ରଥମେ ଫସଲ ଓ ଆକ୍ରାନ୍ତ ଅଂଶ ବାଛନ୍ତୁ। ତା’ପରେ ସ୍ପଷ୍ଟ ଫଟୋ ନିଅନ୍ତୁ।'
                : 'Select crop and plant part, then capture a steady photograph. AI delivers species identification & verified IPM guidance.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCropModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-agri-50 hover:bg-agri-100 border border-agri-300 text-agri-950 font-bold text-xs flex items-center space-x-2 shadow-sm transition-all focus:ring-2 focus:ring-agri-500"
          >
            <span className="text-base">{activeCropInfo?.category === 'cereals_millets' ? '🌾' : activeCropInfo?.category === 'vegetables' ? '🥦' : activeCropInfo?.category === 'fruits_horticulture' ? '🥭' : '🌱'}</span>
            <div className="text-left">
              <span className="text-[10px] text-agri-700 block uppercase font-extrabold">{lang === 'or' ? 'ଚୟନିତ ଫସଲ' : 'Selected Crop'}</span>
              <span className="font-extrabold">{lang === 'or' ? activeCropInfo?.commonNameOr : activeCropInfo?.commonNameEn}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-agri-700 ml-1" />
          </button>
        </div>

        {/* STEP 1: CROP SELECTOR QUICK BAR */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-agri-700 text-white flex items-center justify-center text-[11px]">1</span>
              <span>{lang === 'or' ? 'ଫସଲ ବାଛନ୍ତୁ (Select Crop):' : 'Step 1: Select Your Crop:'}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCropModalOpen(true)}
              className="min-h-[44px] text-agri-700 hover:text-agri-900 font-bold flex items-center space-x-1 text-xs"
            >
              <span>{lang === 'or' ? 'ସମସ୍ତ ୩୨ ଫସଲ ଦେଖନ୍ତୁ' : 'All 32 Odisha Crops'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {POPULAR_CROPS.map((cid) => {
              const c = getCropById(cid);
              if (!c) return null;
              const isSelected = selectedCrop === cid;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => setSelectedCrop(cid)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-agri-800 text-white border-agri-900 shadow-sm ring-2 ring-lime-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cid === 'paddy' ? '🌾' : cid === 'maize' ? '🌽' : cid === 'tomato' ? '🍅' : cid === 'brinjal' ? '🍆' : cid === 'chilli' ? '🌶️' : cid === 'groundnut' ? '🥜' : cid === 'ragi' ? '🥣' : '🥬'}</span>
                  <span>{lang === 'or' ? c.commonNameOr : c.commonNameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: PLANT PART SELECTOR */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700">
            <span className="w-5 h-5 rounded-full bg-agri-700 text-white flex items-center justify-center text-[11px]">2</span>
            <span>{lang === 'or' ? 'ଆକ୍ରାନ୍ତ ଗଛର ଅଂଶ ବାଛନ୍ତୁ (Select Plant Part):' : 'Step 2: Select Plant Part Photographed:'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {PLANT_PARTS.map((part) => {
              const isSelected = selectedPlantPart === part.id;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setSelectedPlantPart(part.id)}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-1.5 text-center ${
                    isSelected
                      ? 'bg-lime-500 text-agri-950 border-lime-600 shadow-sm ring-2 ring-agri-800'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-sm">{part.icon}</span>
                  <span className="truncate">{lang === 'or' ? part.labelOr.split(' ')[0] : part.labelEn.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{lang === 'or' ? 'ତ୍ରୁଟି ଦେଖାଦେଇଛି' : 'Input / System Alert'}</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTO INTERACTION AREA */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700 mb-3">
            <span className="w-5 h-5 rounded-full bg-agri-700 text-white flex items-center justify-center text-[11px]">3</span>
            <span>{lang === 'or' ? 'ଫଟୋ ଉଠାନ୍ତୁ ବା ଅପଲୋଡ୍ କରନ୍ତୁ:' : 'Step 3: Capture or Upload Specimen:'}</span>
          </div>

          {!imageUri ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all ${
                isDragOver 
                  ? 'border-agri-600 bg-agri-50 scale-[1.01]' 
                  : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50'
              }`}
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-agri-100 text-agri-800 flex items-center justify-center shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {lang === 'or' 
                      ? `${activeCropInfo?.commonNameOr || 'ଫସଲ'}ର ଫଟୋ ନିଅନ୍ତୁ କିମ୍ବା ଡ୍ରପ୍ କରନ୍ତୁ` 
                      : `Take a photo of ${activeCropInfo?.commonNameEn || 'crop'} or drag & drop`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'or' ? 'ସମର୍ଥିତ ଫର୍ମାଟ୍: JPG, JPEG, PNG, WEBP (ସର୍ବାଧିକ ୨୫ MB)' : 'Supported formats: JPG, JPEG, PNG, WEBP (up to 25MB)'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="min-h-[44px] cursor-pointer px-6 py-3.5 rounded-2xl bg-lime-500 hover:bg-lime-400 text-agri-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{lang === 'or' ? 'ଲାଇଭ୍ କ୍ୟାମେରା ଖୋଲନ୍ତୁ' : 'Open Live Camera'}</span>
                  </button>

                  <label className="min-h-[44px] cursor-pointer px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 flex items-center justify-center space-x-2 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Upload className="w-4 h-4 text-agri-700" />
                    <span>{lang === 'or' ? 'ଗ୍ୟାଲେରୀରୁ ଆଣନ୍ତୁ' : 'Browse Gallery'}</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="pt-3 text-left bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <span className="font-extrabold text-slate-900 flex items-center space-x-1.5 text-xs">
                    <HelpCircle className="w-4 h-4 text-agri-700 flex-shrink-0" />
                    <span>{lang === 'or' ? 'ନିର୍ଭୁଲ ଚିହ୍ନଟ ପାଇଁ ଫଟୋ ଉଠାଇବାର ନିୟମ:' : 'Field Photography Guide for Reliable AI Identification:'}</span>
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-agri-700 font-bold">•</span>
                      <span>{lang === 'or' ? 'ସ୍ୱାଭାବିକ ଦିନ ଆଲୋକରେ ଫଟୋ ନିଅନ୍ତୁ (ଫ୍ଲାସ୍ ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ)।' : 'Use natural daylight; avoid camera flash glare.'}</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-agri-700 font-bold">•</span>
                      <span>{lang === 'or' ? 'ହାତ ସ୍ଥିର ରଖନ୍ତୁ ଯେପରି ଫଟୋ ଝାପ୍‌ସା (blur) ନ ହୁଏ।' : 'Keep device steady to eliminate motion blur.'}</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-agri-700 font-bold">•</span>
                      <span>{lang === 'or' ? 'ପୋକର ସମ୍ପୂର୍ଣ୍ଣ ଶରୀର ଓ ଡେଣା ନିକଟରୁ (close-up) ନିଅନ୍ତୁ।' : 'Capture a sharp close-up without cutting off insect legs or wings.'}</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-agri-700 font-bold">•</span>
                      <span>{lang === 'or' ? 'ପତ୍ର କ୍ଷତି ଓ ଜୀବନ୍ତ ପୋକର ଅଲଗା ଅଲଗା ଫଟୋ ନିଅନ୍ତୁ।' : 'Take separate photographs of insect body vs foliar damage.'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-300 shadow-md aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
                <img 
                  src={imageUri} 
                  alt="Crop preview" 
                  className="w-full h-full object-contain" 
                />

                {!isAnalyzing && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-black/75 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md flex items-center space-x-1.5 transition-colors focus:ring-2 focus:ring-lime-400"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t.ctaRetake}</span>
                    </button>
                  </div>
                )}

                {imageHash && (
                  <div className="absolute bottom-3 left-3 bg-black/75 text-slate-300 px-3 py-1.5 rounded-xl text-[10px] font-mono backdrop-blur-md flex items-center space-x-1.5 border border-white/10">
                    <Hash className="w-3 h-3 text-lime-400" />
                    <span>SHA-256: {imageHash.slice(0, 12)}...{imageHash.slice(-6)}</span>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-agri-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white text-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full border-4 border-lime-400 border-t-transparent animate-spin flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-lime-300" />
                    </div>
                    <div className="max-w-sm space-y-1">
                      <h4 className="text-lg font-bold text-lime-300 font-sans">
                        {lang === 'or' ? 'AI ବିଶ୍ଳେଷଣ ଚାଲିଛି...' : 'AI Vision Intelligence Analyzing...'}
                      </h4>
                      <p className="text-xs text-agri-100">
                        {analysisStep}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {qualityCheck && !isAnalyzing && (
                <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 transition-colors ${
                  qualityCheck.isClear 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  {qualityCheck.isClear ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold">
                        {qualityCheck.isClear 
                          ? (lang === 'or' ? 'ଫଟୋ ଗୁଣବତ୍ତା: ଉପଯୁକ୍ତ ଓ ସ୍ପଷ୍ଟ' : 'Image Quality: Optimal for Identification') 
                          : (lang === 'or' ? 'ଫଟୋ ଗୁଣବତ୍ତା ଚେତାବନୀ' : 'Image Quality Alert')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Sharpness: {qualityCheck.sharpnessScore}% | Light: {qualityCheck.lightingScore}%
                      </span>
                    </div>
                    {!qualityCheck.isClear && (
                      <p className="mt-1 font-medium text-amber-800 leading-relaxed">
                        {lang === 'or' ? qualityCheck.warningMessageOr : qualityCheck.warningMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2 text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-agri-800">{lang === 'or' ? 'ଫସଲ:' : 'Crop:'}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-bold">{lang === 'or' ? activeCropInfo?.commonNameOr : activeCropInfo?.commonNameEn}</span>
                  <span className="font-extrabold text-agri-800 ml-2">{lang === 'or' ? 'ଅଂଶ:' : 'Part:'}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-bold">{selectedPlantPart}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="min-h-[44px] text-xs font-bold text-agri-700 hover:text-agri-900 underline"
                >
                  {lang === 'or' ? 'ଫସଲ ବଦଳାନ୍ତୁ' : 'Change Crop'}
                </button>
              </div>

              {!isAnalyzing && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    className="min-h-[48px] flex-1 py-4 px-6 rounded-2xl bg-agri-800 hover:bg-agri-900 text-lime-300 font-extrabold text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-agri-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    <span>{lang === 'or' ? 'AI କୀଟ ବିଶ୍ଳେଷଣ ଆରମ୍ଭ କରନ୍ତୁ' : 'Run AI Pest Diagnosis'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[48px] px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
                  >
                    {lang === 'or' ? 'ବାତିଲ କରନ୍ତୁ' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 1-Click Fast Test Strip */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-agri-700" />
            <span>{lang === 'or' ? 'ତୁରନ୍ତ ପରୀକ୍ଷା ନମୁନା' : 'Instant Diagnostic Test Gallery'}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {lang === 'or' ? 'କ୍ଲିକ୍ କରନ୍ତୁ ଓ ଫଟୋ ଦେଖନ୍ତୁ' : 'Click to load specimen instantly'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_PEST_IMAGES.map((sample) => {
            const isSelected = currentSample?.id === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`min-h-[44px] text-left p-2.5 rounded-xl border transition-all text-xs font-medium flex items-center space-x-2 ${
                  isSelected 
                    ? 'border-lime-500 bg-lime-50 text-agri-950 ring-2 ring-lime-400 font-bold shadow-sm' 
                    : 'border-slate-200 hover:border-agri-500 hover:bg-agri-50/50 text-slate-800'
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                  <img src={sample.imageUri} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="line-clamp-1">
                  {lang === 'or' ? sample.labelOr : sample.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FULL 32-CROP SELECTION MODAL */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-agri-900 text-white">
              <div>
                <h3 className="text-lg font-bold">
                  {lang === 'or' ? 'ଓଡ଼ିଶାର ଫସଲ ଚୟନ କରନ୍ତୁ' : 'Select Odisha Crop (32 Registered)'}
                </h3>
                <p className="text-xs text-agri-200 mt-0.5">
                  {lang === 'or' ? 'ସଠିକ ରୋଗ ଓ ପୋକ ଚିହ୍ନଟ ପାଇଁ ଉପଯୁକ୍ତ ଫସଲ ବାଛନ୍ତୁ' : 'Choose crop for accurate diagnostic threshold lookup'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cropSearchQuery}
                  onChange={(e) => setCropSearchQuery(e.target.value)}
                  placeholder={lang === 'or' ? 'ଫସଲ ଖୋଜନ୍ତୁ (ଯଥା: ଧାନ, ମକା, ବାଇଗଣ)...' : 'Search crop by name (e.g. Paddy, Maize, Tomato)...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab('all')}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategoryTab === 'all'
                      ? 'bg-agri-800 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {lang === 'or' ? 'ସବୁ ଫସଲ (୩୨)' : 'All Crops (32)'}
                </button>
                {CROP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategoryTab === cat.id
                        ? 'bg-agri-800 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{cat.icon} {lang === 'or' ? cat.nameOr : cat.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredCrops.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  {lang === 'or' ? 'କୌଣସି ଫସଲ ମିଳିଲା ନାହିଁ।' : 'No crops found matching your search.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCrops.map((c) => {
                    const isSelected = selectedCrop === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCrop(c.id);
                          setIsCropModalOpen(false);
                        }}
                        className={`min-h-[44px] p-3 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-agri-50 border-agri-600 ring-2 ring-lime-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-2xl mt-0.5">
                          {c.category === 'cereals_millets' ? '🌾' : c.category === 'pulses' ? '🌱' : c.category === 'oilseeds' ? '🌻' : c.category === 'vegetables' ? '🥦' : '🥭'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-900 truncate">
                              {lang === 'or' ? c.commonNameOr : c.commonNameEn}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              {c.status === 'FULL_VALIDATED' ? '✓ Validated' : 'Field Pilot'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {lang === 'or' ? c.commonNameEn : c.commonNameOr} • <span className="italic">{c.scientificName}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        lang={lang}
      />
    </div>
  );
};
