import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { FileEdit } from 'lucide-react';
import WizardNav from './components/WizardNav';
import Step1Info from './steps/Step1Info';
import Step2Template from './steps/Step2Template';
import Step3Content from './steps/Step3Content';
import Step4Review from './steps/Step4Review';
import Step5Publish from './steps/Step5Publish';
import type { PptReport, PptSlideData } from '../../types/ppt';
import { usePptStorage } from '../../hooks/usePptStorage';

const STEPS = [
  { label: '填写信息' },
  { label: '选择模板' },
  { label: '配置内容' },
  { label: '预览审核' },
  { label: '存档发布' },
];

interface Props {
  editReport?: PptReport;
}

export default function CreateReport({ editReport }: Props) {
  const navigate = useNavigate();
  const { save } = usePptStorage();
  const [currentStep, setCurrentStep] = useState(0);

  const [info, setInfo] = useState({
    name: editReport?.name || '',
    department: editReport?.department || '',
    date: editReport?.date || new Date().toISOString().slice(0, 10),
    author: editReport?.author || '',
  });

  const [templateId, setTemplateId] = useState(editReport?.templateId || 'china-mobile');
  const [fixedSlides, setFixedSlides] = useState<PptSlideData[]>([]);
  const [bodySlides, setBodySlides] = useState<PptSlideData[]>([]);

  useEffect(() => {
    if (editReport) {
      setInfo({
        name: editReport.name,
        department: editReport.department,
        date: editReport.date,
        author: editReport.author,
      });
      setTemplateId(editReport.templateId);
      const slidesWithKind = editReport.slides.map((s, i, arr) => {
        if (s.kind) return s;
        if (i === 0) return { ...s, kind: 'cover' as const };
        if (i === 1) return { ...s, kind: 'outline' as const };
        if (i === arr.length - 1) return { ...s, kind: 'end' as const };
        return { ...s, kind: 'body' as const };
      });
      const fixed = slidesWithKind.filter((s) => s.kind !== 'body');
      const body = slidesWithKind.filter((s) => s.kind === 'body');
      setFixedSlides(fixed);
      setBodySlides(body);
    }
  }, [editReport]);

  const handleStep1Submit = useCallback((data: typeof info) => {
    setInfo(data);
    setCurrentStep(1);
  }, []);

  const handleStep2Submit = useCallback((newFixedSlides: PptSlideData[], newTemplateId: string) => {
    setFixedSlides(newFixedSlides);
    setTemplateId(newTemplateId);
    setCurrentStep(2);
  }, []);

  const handleStep3Submit = useCallback((newBodySlides: PptSlideData[]) => {
    setBodySlides(newBodySlides);
    setCurrentStep(3);
  }, []);

  const handleStep4Next = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const fullSlides = useMemo(() => {
    if (fixedSlides.length === 0) return [];
    const cover = fixedSlides.find((s) => s.kind === 'cover') || fixedSlides[0];
    const outlineRaw = fixedSlides.find((s) => s.kind === 'outline') || fixedSlides[1];
    const end = fixedSlides.find((s) => s.kind === 'end') || fixedSlides[fixedSlides.length - 1];

    const outline = {
      ...outlineRaw,
      content: {
        type: 'text' as const,
        body: bodySlides.map((slide, idx) => `${idx + 1}. ${slide.title}`).join('\n') || '暂无正文页',
      },
    };

    const all = [cover, outline, ...bodySlides, end];
    return all.map((s, i) => ({ ...s, pageNumber: i + 1 }));
  }, [fixedSlides, bodySlides]);

  const handleUpdateSlide = useCallback((updated: PptSlideData) => {
    if (updated.kind !== 'body') {
      setFixedSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      setBodySlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
  }, []);

  const handleReorderBodySlides = useCallback((newBodySlides: PptSlideData[]) => {
    setBodySlides(newBodySlides);
  }, []);

  const handleStep5Save = useCallback(
    (report: PptReport) => {
      save(report);
      navigate('/ppt-editor/list');
    },
    [save, navigate]
  );

  const handleStepClick = useCallback(
    (step: number) => {
      if (step < currentStep) {
        setCurrentStep(step);
      }
    },
    [currentStep]
  );

  return (
    <ModuleLayout title="撰写PPT" icon={<FileEdit className="w-6 h-6" />}>
      <WizardNav steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

      <div className="max-w-[1200px] mx-auto">
        {currentStep === 0 && (
          <Step1Info initialData={info} onSubmit={handleStep1Submit} />
        )}

        {currentStep === 1 && (
          <Step2Template
            info={info}
            initialTemplateId={templateId}
            onSubmit={handleStep2Submit}
          />
        )}

        {currentStep === 2 && (
          <Step3Content
            key="step3"
            initialSlides={bodySlides.length > 0 ? bodySlides : undefined}
            onSubmit={handleStep3Submit}
          />
        )}

        {currentStep === 3 && fullSlides.length > 0 && (
          <Step4Review
            report={{
              name: info.name,
              department: info.department,
              date: info.date,
              author: info.author,
              templateId,
              slides: fullSlides,
            }}
            onBack={() => setCurrentStep(2)}
            onNext={handleStep4Next}
            onUpdateSlide={handleUpdateSlide}
            onReorderBodySlides={handleReorderBodySlides}
          />
        )}

        {currentStep === 4 && fullSlides.length > 0 && (
          <Step5Publish
            report={{
              name: info.name,
              department: info.department,
              date: info.date,
              author: info.author,
              templateId,
              slides: fullSlides,
            }}
            editId={editReport?.id}
            originalCreatedAt={editReport?.createdAt}
            onSave={handleStep5Save}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </ModuleLayout>
  );
}
