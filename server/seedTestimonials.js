require('dotenv').config();
const mongoose = require('mongoose');
const Testimonial = require('./models/Testimonial');

const testimonials = [
  {
    name: 'Priya Shah',
    course: 'BCA 3rd Year',
    text: 'CampusNex has completely transformed my college experience. The attendance tracking and result portal make everything so convenient. I can focus more on my studies rather than worrying about administrative tasks.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: true,
    order: 10
  },
  {
    name: 'Rahul Patel',
    course: 'BBA 2nd Year',
    text: 'The fee payment system is amazing! No more standing in long queues. I can pay my fees online and get instant confirmation. The hostel management features are also very helpful.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: true,
    order: 9
  },
  {
    name: 'Anjali Mehta',
    course: 'BSc IT 1st Year',
    text: 'The admission process was so smooth through CampusNex. I got my application ID instantly and could track my application status in real-time. Highly recommend this college!',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: true,
    order: 8
  },
  {
    name: 'Karan Singh',
    course: 'BCA 2nd Year',
    text: 'The library management system is fantastic. I can search for books, check availability, and even reserve them online. The digital resources are also easily accessible.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: true,
    order: 7
  },
  {
    name: 'Sneha Joshi',
    course: 'BBA 3rd Year',
    text: 'The exam management and result portal are excellent. I get notifications for exam schedules and results are published quickly. The interface is very user-friendly.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: true,
    order: 6
  },
  {
    name: 'Arjun Kumar',
    course: 'BSc IT 2nd Year',
    text: 'Great college with modern facilities. The CampusNex portal makes everything accessible from anywhere. Faculty is supportive and the learning environment is excellent.',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: true,
    order: 5
  },
  {
    name: 'Riya Sharma',
    course: 'BCA 1st Year',
    text: 'Just joined this college and I am impressed with the digital infrastructure. Everything from timetables to notices is available online. Very convenient for students.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: false, // Pending approval
    order: 4
  },
  {
    name: 'Vikash Yadav',
    course: 'BBA 1st Year',
    text: 'The placement support and industry connections are amazing. Regular guest lectures and workshops help us stay updated with industry trends.',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    isApproved: false, // Pending approval
    order: 3
  }
];

async function seedTestimonials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log('Cleared existing testimonials');

    // Insert new testimonials
    await Testimonial.insertMany(testimonials);
    console.log(`✅ Seeded ${testimonials.length} testimonials`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding testimonials:', error);
    process.exit(1);
  }
}

seedTestimonials();