import { PrismaClient, Role, LoanStatus, ListType } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  console.log('📚 Seeding categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        description: 'Programming and software development books',
        slug: 'programming',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'software-architecture' },
      update: {},
      create: {
        name: 'Software Architecture',
        description: 'System design and architecture patterns',
        slug: 'software-architecture',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'interview-preparation' },
      update: {},
      create: {
        name: 'Interview Preparation',
        description: 'Technical interview and coding challenge resources',
        slug: 'interview-preparation',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        description: 'Frontend and backend web development',
        slug: 'web-development',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        description: 'Data analysis, machine learning, and AI',
        slug: 'data-science',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fiction' },
      update: {},
      create: {
        name: 'Fiction',
        description: 'Fictional literature and novels',
        slug: 'fiction',
      },
    }),
  ])

  // Create users
  console.log('👥 Seeding users...')
  const passwordHash = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@digitallibrary.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@digitallibrary.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'librarian@digitallibrary.com' },
      update: {},
      create: {
        username: 'librarian',
        email: 'librarian@digitallibrary.com',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        role: Role.LIBRARIAN,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        username: 'john_doe',
        email: 'john.doe@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: Role.USER,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        username: 'alice_wonder',
        email: 'alice@example.com',
        passwordHash,
        firstName: 'Alice',
        lastName: 'Wonder',
        role: Role.USER,
        emailVerified: true,
      },
    }),
  ])

  // Find categories by slug for books
  const programmingCategory = categories.find(c => c.slug === 'programming')!
  const architectureCategory = categories.find(c => c.slug === 'software-architecture')!
  const interviewCategory = categories.find(c => c.slug === 'interview-preparation')!
  const webCategory = categories.find(c => c.slug === 'web-development')!

  // Create books
  console.log('📖 Seeding books...')
  const books = await Promise.all([
    prisma.book.upsert({
      where: { isbn: '9780134685991' },
      update: {},
      create: {
        isbn: '9780134685991',
        title: 'Effective Java',
        subtitle: 'Best Practices for the Java Platform',
        authors: ['Joshua Bloch'],
        description: 'The definitive guide to Java programming from the creator of the Java platform.',
        publisher: 'Addison-Wesley Professional',
        publishedDate: new Date('2017-12-27'),
        pageCount: 416,
        language: 'en',
        categoryId: programmingCategory.id,
        tags: ['Java', 'Programming', 'Best Practices'],
        rating: 4.8,
        totalCopies: 3,
        availableCopies: 3,
      },
    }),
    prisma.book.upsert({
      where: { isbn: '9780132350884' },
      update: {},
      create: {
        isbn: '9780132350884',
        title: 'Clean Code',
        subtitle: 'A Handbook of Agile Software Craftsmanship',
        authors: ['Robert C. Martin'],
        description: 'A handbook of agile software craftsmanship that will instill within you the values of a software craftsman.',
        publisher: 'Prentice Hall',
        publishedDate: new Date('2008-08-01'),
        pageCount: 464,
        language: 'en',
        categoryId: programmingCategory.id,
        tags: ['Clean Code', 'Programming', 'Software Engineering'],
        rating: 4.7,
        totalCopies: 5,
        availableCopies: 4,
      },
    }),
    prisma.book.upsert({
      where: { isbn: '9781491950296' },
      update: {},
      create: {
        isbn: '9781491950296',
        title: 'Building Microservices',
        subtitle: 'Designing Fine-Grained Systems',
        authors: ['Sam Newman'],
        description: 'Learn how to build microservices: from design principles to implementation strategies.',
        publisher: 'O\'Reilly Media',
        publishedDate: new Date('2015-02-20'),
        pageCount: 280,
        language: 'en',
        categoryId: architectureCategory.id,
        tags: ['Microservices', 'Architecture', 'Distributed Systems'],
        rating: 4.5,
        totalCopies: 2,
        availableCopies: 2,
      },
    }),
    prisma.book.upsert({
      where: { isbn: '9780321127426' },
      update: {},
      create: {
        isbn: '9780321127426',
        title: 'Patterns of Enterprise Application Architecture',
        authors: ['Martin Fowler'],
        description: 'An invaluable catalog of architectural patterns for enterprise applications.',
        publisher: 'Addison-Wesley Professional',
        publishedDate: new Date('2002-11-15'),
        pageCount: 560,
        language: 'en',
        categoryId: architectureCategory.id,
        tags: ['Architecture', 'Design Patterns', 'Enterprise'],
        rating: 4.6,
        totalCopies: 2,
        availableCopies: 1,
      },
    }),
    prisma.book.upsert({
      where: { isbn: '9780984782857' },
      update: {},
      create: {
        isbn: '9780984782857',
        title: 'Cracking the Coding Interview',
        subtitle: '189 Programming Questions and Solutions',
        authors: ['Gayle Laakmann McDowell'],
        description: 'The ultimate guide for programming interviews covering 189 programming questions.',
        publisher: 'CareerCup',
        publishedDate: new Date('2015-07-01'),
        pageCount: 687,
        language: 'en',
        categoryId: interviewCategory.id,
        tags: ['Interview', 'Algorithms', 'Programming'],
        rating: 4.4,
        totalCopies: 4,
        availableCopies: 3,
      },
    }),
    prisma.book.upsert({
      where: { isbn: '9781617294549' },
      update: {},
      create: {
        isbn: '9781617294549',
        title: 'Spring in Action',
        subtitle: 'Covers Spring 5.0',
        authors: ['Craig Walls'],
        description: 'The comprehensive guide to Spring framework development.',
        publisher: 'Manning Publications',
        publishedDate: new Date('2018-10-03'),
        pageCount: 520,
        language: 'en',
        categoryId: webCategory.id,
        tags: ['Spring', 'Java', 'Framework'],
        rating: 4.3,
        totalCopies: 3,
        availableCopies: 2,
      },
    }),
  ])

  // Create sample book loans
  console.log('📋 Seeding book loans...')
  const johnUser = users.find(u => u.username === 'john_doe')!
  const aliceUser = users.find(u => u.username === 'alice_wonder')!
  const cleanCodeBook = books.find(b => b.title === 'Clean Code')!
  const enterprisePatternsBook = books.find(b => b.title === 'Patterns of Enterprise Application Architecture')!

  await Promise.all([
    prisma.bookLoan.upsert({
      where: { 
        id: 'loan1' // Using a fixed ID for upsert
      },
      update: {},
      create: {
        id: 'loan1',
        userId: johnUser.id,
        bookId: cleanCodeBook.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: LoanStatus.ACTIVE,
      },
    }),
    prisma.bookLoan.upsert({
      where: { 
        id: 'loan2' 
      },
      update: {},
      create: {
        id: 'loan2',
        userId: aliceUser.id,
        bookId: enterprisePatternsBook.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: LoanStatus.ACTIVE,
      },
    }),
  ])

  // Create sample book reviews
  console.log('⭐ Seeding book reviews...')
  const effectiveJavaBook = books.find(b => b.title === 'Effective Java')!
  const crackingInterviewBook = books.find(b => b.title === 'Cracking the Coding Interview')!

  await Promise.all([
    prisma.bookReview.upsert({
      where: { 
        userId_bookId: {
          userId: johnUser.id,
          bookId: effectiveJavaBook.id
        }
      },
      update: {},
      create: {
        userId: johnUser.id,
        bookId: effectiveJavaBook.id,
        rating: 5,
        reviewText: 'Excellent book for Java developers. Highly recommended!',
      },
    }),
    prisma.bookReview.upsert({
      where: { 
        userId_bookId: {
          userId: aliceUser.id,
          bookId: cleanCodeBook.id
        }
      },
      update: {},
      create: {
        userId: aliceUser.id,
        bookId: cleanCodeBook.id,
        rating: 5,
        reviewText: 'Clean Code is a must-read for every programmer. Life-changing!',
      },
    }),
    prisma.bookReview.upsert({
      where: { 
        userId_bookId: {
          userId: johnUser.id,
          bookId: crackingInterviewBook.id
        }
      },
      update: {},
      create: {
        userId: johnUser.id,
        bookId: crackingInterviewBook.id,
        rating: 4,
        reviewText: 'Great resource for technical interviews, covers most common patterns.',
      },
    }),
  ])

  // Create sample user book lists
  console.log('📝 Seeding user book lists...')
  const microservicesBook = books.find(b => b.title === 'Building Microservices')!
  const springBook = books.find(b => b.title === 'Spring in Action')!

  await Promise.all([
    prisma.userBookList.upsert({
      where: {
        userId_bookId_listType: {
          userId: johnUser.id,
          bookId: effectiveJavaBook.id,
          listType: ListType.FAVORITES
        }
      },
      update: {},
      create: {
        userId: johnUser.id,
        bookId: effectiveJavaBook.id,
        listType: ListType.FAVORITES,
      },
    }),
    prisma.userBookList.upsert({
      where: {
        userId_bookId_listType: {
          userId: johnUser.id,
          bookId: microservicesBook.id,
          listType: ListType.WISHLIST
        }
      },
      update: {},
      create: {
        userId: johnUser.id,
        bookId: microservicesBook.id,
        listType: ListType.WISHLIST,
      },
    }),
    prisma.userBookList.upsert({
      where: {
        userId_bookId_listType: {
          userId: aliceUser.id,
          bookId: cleanCodeBook.id,
          listType: ListType.FAVORITES
        }
      },
      update: {},
      create: {
        userId: aliceUser.id,
        bookId: cleanCodeBook.id,
        listType: ListType.FAVORITES,
      },
    }),
    prisma.userBookList.upsert({
      where: {
        userId_bookId_listType: {
          userId: aliceUser.id,
          bookId: springBook.id,
          listType: ListType.READING
        }
      },
      update: {},
      create: {
        userId: aliceUser.id,
        bookId: springBook.id,
        listType: ListType.READING,
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })