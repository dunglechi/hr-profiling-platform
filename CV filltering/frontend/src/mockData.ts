// Mock CV data for demo without real API
const MOCK_CV_DATA = {
  personalInfo: {
    name: "Nguyễn Văn Minh",
    email: "nguyen.van.minh@email.com",
    phone: "+84 901 234 567",
    address: "Hà Nội, Việt Nam"
  },
  experience: [
    {
      position: "Senior Software Engineer",
      company: "Tech Solutions Vietnam",
      duration: "2022 - Present",
      description: "Lead development of enterprise web applications using React, Node.js, and PostgreSQL. Managed team of 5 developers."
    },
    {
      position: "Full Stack Developer",
      company: "Digital Innovation Corp",
      duration: "2020 - 2022",
      description: "Developed responsive web applications, RESTful APIs, and database optimization."
    }
  ],
  education: [
    {
      degree: "Bachelor of Computer Science",
      institution: "Đại học Bách Khoa Hà Nội",
      year: "2020"
    }
  ],
  skills: ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "AWS", "Docker"],
  numerologyInsights: {
    lifePath: 7,
    personality: "Analytical, Spiritual",
    careerFit: "Research, Analysis",
    compatibilityScore: 87
  }
};

export const MockData = {
  CV_DATA: MOCK_CV_DATA,
  
  // Simulate API delay
  delay: (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock file processing
  mockProcessFile: async (file: File) => {
    console.log(`Processing file: ${file.name} (${file.size} bytes)`);
    
    // Simulate processing time
    await MockData.delay(3000);
    
    // Return mock data
    return {
      success: true,
      data: MOCK_CV_DATA
    };
  }
};