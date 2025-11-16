/**
 * LessonListScreen Component
 * 
 * Displays all lessons in the learning plan with completion status.
 * Users can click to view lesson details.
 * 
 * Props:
 * - learningPlan: Array of lesson objects
 * - setCurrentScreen: Callback to navigate screens
 * - setCurrentLesson: Callback to set selected lesson
 * - completedLessonIds: Array of completed lesson IDs
 */

import React from 'react';
import Icon from '../components/Icon';

const LessonListScreen = ({ learningPlan, setCurrentScreen, setCurrentLesson, completedLessonIds }) => {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Learning Plan</h1>
      <div className="space-y-4">
        {learningPlan.map((lesson, index) => (
          <div
            key={lesson.id}
            onClick={() => {
              setCurrentLesson(lesson);
              setCurrentScreen('lesson-detail');
            }}
            className="p-5 bg-white rounded-xl shadow-sm cursor-pointer transition-colors hover:bg-gray-50 flex items-center"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${completedLessonIds.includes(lesson.id) ? 'bg-green-500' : 'bg-blue-500'}`}>
              {completedLessonIds.includes(lesson.id) ? (
                <Icon name="check" className="text-white" />
              ) : (
                <span className="text-white font-bold">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
            <Icon name="chevron" className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonListScreen;
