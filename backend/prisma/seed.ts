import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users and candidates
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'CANDIDATE',
      candidate: {
        create: {
          fullName: 'Nguyễn Văn Test',
          birthDate: new Date('1990-01-15'),
          phone: '0123456789'
        }
      }
    },
    include: {
      candidate: true
    }
  })

  // Create test job position
  const jobPosition = await prisma.jobPosition.create({
    data: {
      title: 'Software Developer',
      description: 'Full-stack developer position requiring React and Node.js skills',
      requirements: JSON.stringify({
        skills: ['React', 'Node.js', 'TypeScript', 'Database'],
        experience: '2+ years',
        education: 'Bachelor degree preferred'
      }),
      weights: JSON.stringify({
        disc: 0.25,
        mbti: 0.25,
        numerology: 0.15,
        cv: 0.25,
        experience: 0.10
      })
    }
  })

  // Create test assessment
  const assessment = await prisma.assessment.create({
    data: {
      candidateId: testUser.candidate!.id,
      jobPositionId: jobPosition.id,
      status: 'PENDING'
    }
  })

  console.log('✅ Seed data created successfully!')
  console.log('📊 Test User:', testUser.email)
  console.log('💼 Job Position:', jobPosition.title)
  console.log('📝 Assessment ID:', assessment.id)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })