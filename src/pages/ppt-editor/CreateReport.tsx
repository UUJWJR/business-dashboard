import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { FileEdit } from 'lucide-react';
import WizardNav from './components/WizardNav';
import Step1Info from './steps/Step1Info';
import Step2Template from './steps/Step2Template';
import Step3Preview from './steps/Step3Preview';
import type { PptReport, PptSlideData } from '../../types/ppt';
import { usePptStorage } from '../../hooks/usePptStorage';

const STEPS = [
  { label: '填写信息' },
  { label: '配置内容' },
  { label: '预览导出' },
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

  const [slides, setSlides] = useState<PptSlideData[]>(editReport?.slides || []);
  const [templateId, setTemplateId] = useState(editReport?.templateId || 'brand-blue');

  const handleStep1Submit = useCallback((data: typeof info) => {
    setInfo(data);
    setCurrentStep(1);
  }, []);

  const handleStep2Submit = useCallback((newSlides: PptSlideData[], newTemplateId: string) => {
    setSlides(newSlides);
    setTemplateId(newTemplateId);
    setCurrentStep(2);
  }, []);

  const handleStep3Save = useCallback((report: PptReport) => {
    save(report);
    navigate('/ppt-editor/list');
  }, [save, navigate]);

  const handleStepClick = useCallback((step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  return (
    <ModuleLayout title="撰写PPT" icon={<FileEdit className="w-6 h-6" />}>
      <WizardNav
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="max-w-[1200px] mx-auto">
        {currentStep === 0 && (
          <Step1Info
            initialData={info}
            onSubmit={handleStep1Submit}
          />
        )}

        {currentStep === 1 && (
          <Step2Template
            initialSlides={slides.length > 0 ? slides : undefined}
            initialTemplateId={templateId}
            onSubmit={handleStep2Submit}
          />
        )}

        {currentStep === 2 && (
          <Step3Preview
            report={{
              name: info.name,
              department: info.department,
              date: info.date,
              author: info.author,
              templateId,
              slides,
            }}
            onSave={handleStep3Save}
          />
        )}
      </div>
    </ModuleLayout>
  );
}
