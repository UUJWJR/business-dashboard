import { useNavigate } from 'react-router-dom';
import { FileEdit, Trash2, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { usePptStorage } from '../../hooks/usePptStorage';
import PptSlide from './components/PptSlide';
import { getTemplateById, PPT_TEMPLATES } from '../../utils/pptTemplates';

export default function ReportList() {
  const navigate = useNavigate();
  const { reports, remove } = usePptStorage();

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这份报告吗？')) {
      remove(id);
    }
  };

  return (
    <ModuleLayout
      title="撰写PPT"
      icon={<FileEdit className="w-6 h-6" />}
      actions={
        <button
          onClick={() => navigate('/ppt-editor/create')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-btn transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新建报告
        </button>
      }
    >
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <FileText className="w-16 h-16 mb-4 opacity-40" />
          <p className="text-lg font-medium mb-2">暂无报告</p>
          <p className="text-sm mb-6">点击右上角按钮创建第一份 PPT 报告</p>
          <button
            onClick={() => navigate('/ppt-editor/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-btn transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建报告
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {reports.map((report, index) => {
            const template = getTemplateById(report.templateId) || PPT_TEMPLATES[0];
            const coverSlide = report.slides.find((s) => s.kind === 'cover');
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 封面缩略图 */}
                {coverSlide ? (
                  <div
                    className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
                    style={{ aspectRatio: '16 / 9' }}
                    onClick={() => navigate(`/ppt-editor/edit/${report.id}`)}
                  >
                    <div
                      className="absolute top-0 left-0"
                      style={{
                        width: '500%',
                        height: '500%',
                        transform: 'scale(0.2)',
                        transformOrigin: 'top left',
                      }}
                    >
                      <PptSlide
                        slide={coverSlide}
                        template={template}
                        totalPages={report.slides.length}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-b border-gray-100 dark:border-gray-700"
                    style={{ aspectRatio: '16 / 9' }}
                  >
                    <FileText className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className="p-2.5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">
                      {report.name}
                    </h3>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                    {report.department} · {report.date}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {report.author} · {report.slides.length} 页
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {new Date(report.updatedAt).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => navigate(`/ppt-editor/edit/${report.id}`)}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      编辑
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </ModuleLayout>
  );
}
