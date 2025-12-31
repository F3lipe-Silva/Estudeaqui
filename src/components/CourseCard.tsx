'use client';

import Link from 'next/link';
import { Course } from '@/lib/database';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {course.thumbnail && (
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {course.category}
          </span>
          <span className="text-sm text-gray-500">
            {course.level}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        {course.instructor && (
          <p className="text-sm text-gray-500 mb-4">
            Por {course.instructor}
          </p>
        )}
        
        <Link 
          href={`/courses/${course.$id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Ver Curso
        </Link>
      </div>
    </div>
  );
}
