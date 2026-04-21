import { useState } from 'react';

interface Props {
  initialData?: {
    name: string;
    department: string;
    date: string;
    author: string;
  };
  onSubmit: (data: { name: string; department: string; date: string; author: string }) => void;
}

export default function Step1Info({ initialData, onSubmit }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [author, setAuthor] = useState(initialData?.author || '');

  const isValid = name.trim() && department.trim() && date && author.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), department: department.trim(), date, author: author.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            报告名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="请输入报告名称"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">{name.length}/30</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            部门 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="请输入部门名称"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            日期 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            作者 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="请输入作者姓名"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-btn transition-colors"
        >
          下一步
        </button>
      </div>
    </form>
  );
}
