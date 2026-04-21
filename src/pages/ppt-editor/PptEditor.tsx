import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import ReportList from './ReportList';
import CreateReport from './CreateReport';
import { usePptStorage } from '../../hooks/usePptStorage';

function EditReportWrapper() {
  const { id } = useParams<{ id: string }>();
  const { getById } = usePptStorage();
  const report = id ? getById(id) : undefined;

  if (!report) {
    return <Navigate to="/ppt-editor/list" replace />;
  }

  return <CreateReport editReport={report} />;
}

export default function PptEditor() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ppt-editor/list" replace />} />
      <Route path="/list" element={<ReportList />} />
      <Route path="/create" element={<CreateReport />} />
      <Route path="/edit/:id" element={<EditReportWrapper />} />
    </Routes>
  );
}
