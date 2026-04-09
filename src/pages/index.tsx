import React, { useEffect, useMemo, useState } from "react";
import {
  Code,
  Database,
  BrainCircuit,
  School,
  Trophy,
  Target,
  Server,
  Laptop,
  Search,
} from "lucide-react";
import Link from "next/link";
import { courses } from "@/Components/data/constant";
import {
  getOfflineCourseIds,
  getOfflineUpdateEventName,
} from "@/lib/offlineCourses";
const index = () => {
  const certificates = [
    {
      title: "IBM Back-End Development",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "IBM Full Stack Software Developer",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "IBM Developer",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "IBM DevOps and Software Engineering",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const genAICourses = [
    {
      title: "IBM Generative AI Engineering",
      provider: "IBM",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Agents: AI and AI Agents for Leaders",
      provider: "DeepLearning.AI",
      type: "Specialization",
      image:
        "https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Microsoft AI & ML Engineering",
      provider: "Microsoft",
      type: "Professional Certificate",
      image:
        "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=800&q=80",
    },
  ];
  const categories = [
    { icon: Code, name: "Computer Science", count: "425+ Courses" },
    { icon: Database, name: "Data Science", count: "320+ Courses" },
    { icon: BrainCircuit, name: "AI & ML", count: "280+ Courses" },
    { icon: School, name: "Business", count: "890+ Courses" },
    { icon: Trophy, name: "Personal Development", count: "215+ Courses" },
    { icon: Target, name: "Marketing", count: "190+ Courses" },
  ];

  const stats = [
    { number: "92M+", label: "Learners" },
    { number: "3,800+", label: "Courses" },
    { number: "275+", label: "Partners" },
    { number: "175+", label: "Countries" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [offlineCourseIds, setOfflineCourseIds] = useState<string[]>([]);

  const availableTags = useMemo(() => {
    const uniqueTags = new Set<string>();

    courses.forEach((course) => {
      course.tags.forEach((tag) => uniqueTags.add(tag));
    });

    return ["All", ...Array.from(uniqueTags)];
  }, []);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${course.title} ${course.description}`
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesTag =
        selectedTag === "All" || course.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshOfflineIds = () => {
      setOfflineCourseIds(getOfflineCourseIds());
    };

    const eventName = getOfflineUpdateEventName();
    refreshOfflineIds();
    window.addEventListener(eventName, refreshOfflineIds);

    return () => {
      window.removeEventListener(eventName, refreshOfflineIds);
    };
  }, []);

  return (
    <div>
      <div className="bg-[#F3F4F5] py-2">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm text-center">
            Learn from Adobe experts, gain graphic design skills, and build a
            portfolio that gets you noticed.
            <a href="#" className="text-[#0056D2] ml-1 hover:underline">
              Learn today!
            </a>
            <button className="ml-2 text-gray-500">×</button>
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center">
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Learn without limits
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Start, switch, or advance your career with more than 10,000
                courses, Professional Certificates, and degrees from world-class
                universities and companies.
              </p>
              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-[#0056D2] text-white font-semibold rounded-sm">
                  Join for Free
                </button>
                <button className="px-6 py-3 border border-[#0056D2] text-[#0056D2] font-semibold rounded-sm">
                  Try Coursera for Business
                </button>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                alt="Student"
                className="w-[500px] h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Most Popular Certificates</h2>
            <div className="flex space-x-4">
              <button className="px-4 py-2 border text-[#0056D2] font-semibold rounded-sm">
                Show more
              </button>
              <button className="px-4 py-2 text-[#0056D2] font-semibold">
                View all
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {certificates.map((cert, index) => (
              <div
                key={index}
                className="border rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Server className="h-6 w-6 mr-2 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {cert.provider}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{cert.title}</h3>
                  <p className="text-sm text-gray-600">{cert.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#F3F4F5] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Get started with GenAI
              </h2>
              <p className="text-gray-600">
                Identify, develop, and execute impactful GenAI business
                strategies.
              </p>
            </div>
            <button className="ml-auto px-4 py-2 text-[#0056D2] font-semibold">
              View all GenAI
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {genAICourses.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <BrainCircuit className="h-6 w-6 mr-2 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {course.provider}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">New on Coursera</h2>
              <p className="text-gray-600">
                Explore our newest programs, focused on delivering in-demand
                skills.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              {filteredCourses.length} course
              {filteredCourses.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search courses by title or description..."
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedTag === tag
                      ? "bg-[#0056D2] border-[#0056D2] text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:border-[#0056D2] hover:text-[#0056D2]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.id}`}
                className="border rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Laptop className="h-6 w-6 mr-2 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      {course.provider}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  {offlineCourseIds.includes(course.id) && (
                    <span className="inline-flex items-center text-xs px-2 py-1 mb-3 rounded-full bg-green-100 text-green-700">
                      Available Offline
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-blue-50 text-[#0056D2]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{course.type}</p>
                </div>
              </Link>
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div className="mt-8 border border-dashed border-gray-300 rounded-md p-8 text-center">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                No matching courses found
              </p>
              <p className="text-sm text-gray-600">
                Try a different keyword or choose another tag.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Explore Top Categories
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center p-6 bg-white rounded-lg hover:shadow-md cursor-pointer"
              >
                <category.icon className="h-8 w-8 text-[#0056D2] mr-4" />
                <div>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-gray-600 text-sm">{category.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0056D2] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Join the World's Largest Learning Platform
            </h2>
            <p className="text-blue-100">
              Transform your life through education
            </p>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
