'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface Experience {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  bulletPoints: string[];
}

interface ExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: Experience) => void;
  initialData?: Experience | null;
}

export default function ExperienceForm({ isOpen, onClose, onSave, initialData }: ExperienceFormProps) {
  const [experience, setExperience] = useState<Experience>({
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    bulletPoints: ['']
  });

  useEffect(() => {
    if (initialData) {
      setExperience(initialData);
    } else {
      setExperience({
        role: '',
        company: '',
        startDate: '',
        endDate: '',
        location: '',
        bulletPoints: ['']
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(experience);
    onClose();
  };

  const addBulletPoint = () => {
    setExperience(prev => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, '']
    }));
  };

  const removeBulletPoint = (index: number) => {
    setExperience(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
    }));
  };

  const updateBulletPoint = (index: number, value: string) => {
    setExperience(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((point, i) => i === index ? value : point)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0e0c12] border border-[#23263a] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
              Role
            </label>
            <input
              type="text"
              id="role"
              value={experience.role}
              onChange={e => setExperience(prev => ({ ...prev, role: e.target.value }))}
              className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
              required
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={experience.company}
              onChange={e => setExperience(prev => ({ ...prev, company: e.target.value }))}
              className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="text"
                id="startDate"
                value={experience.startDate}
                onChange={e => setExperience(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="e.g., Jan 2020"
                className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="text"
                id="endDate"
                value={experience.endDate}
                onChange={e => setExperience(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="e.g., Present"
                className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={experience.location}
              onChange={e => setExperience(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., San Francisco, CA"
              className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Bullet Points
              </label>
              <button
                type="button"
                onClick={addBulletPoint}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
              >
                <FaPlus size={12} />
                Add Point
              </button>
            </div>
            <div className="space-y-2">
              {experience.bulletPoints.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={e => updateBulletPoint(index, e.target.value)}
                    className="flex-1 bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                    placeholder="Describe your accomplishment..."
                    required
                  />
                  {experience.bulletPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBulletPoint(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#2563eb] text-white px-4 py-2 rounded-md hover:bg-[#1d4ed8] transition-colors"
            >
              Save Experience
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
