'use client';

import { useCourse } from '@/hooks/useDatabase';
import { useLessons } from '@/hooks/useDatabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { course, loading: courseLoading, error: courseError } = useCourse(params.id);
  const { lessons, loading: lessonsLoading, error: lessonsError } = useLessons(params.id);

  if (courseLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || lessonsError || !course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/courses"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Voltar para Cursos
          </Link>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  Nível: {course.level}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                {course.description}
              </p>

              {course.instructor && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Instrutor</h3>
                  <p className="text-gray-600">{course.instructor}</p>
                </div>
              )}

              {course.requirements && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Requisitos</h3>
                  <p className="text-gray-600">{course.requirements}</p>
                </div>
              )}

              {course.objectives && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">O que você vai aprender</h3>
                  <p className="text-gray-600">{course.objectives}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              {course.thumbnail && (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full rounded-lg shadow-lg mb-6"
                />
              )}
              
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                Matricular-se no Curso
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Aulas do Curso</h2>
          
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📹</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Nenhuma aula disponível ainda
              </h3>
              <p className="text-gray-600">
                As aulas deste curso serão adicionadas em breve!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.$id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded mr-3">
                          Aula {index + 1}
                        </span>
                        {lesson.free && (
                          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            Gratuita
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-600">
                        {lesson.description}
                      </p>
                      {lesson.videoDuration && (
                        <p className="text-sm text-gray-500 mt-2">
                          Duração: {lesson.videoDuration}
                        </p>
                      )}
                    </div>
                    <button className="ml-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200">
                      Assistir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
