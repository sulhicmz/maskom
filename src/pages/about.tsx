
import { FC } from 'hono/jsx'

const AboutPage: FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">About Maskom Network</h1>
      <p className="text-lg mb-4">
        Maskom Network is a pioneering startup dedicated to revolutionizing digital communication and collaboration. Our mission is to create seamless, secure, and innovative platforms that empower individuals and businesses to connect and achieve their goals more effectively.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
      <p className="text-md mb-4">
        To build a connected world where technology enhances human interaction, fosters creativity, and drives progress. We believe in the power of community and strive to develop tools that bring people closer, regardless of geographical boundaries.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Team</h2>
      <p className="text-md mb-4">
        We are a passionate team of innovators, developers, and designers committed to excellence. Our diverse backgrounds and shared vision enable us to tackle complex challenges and deliver exceptional user experiences. We are constantly learning, adapting, and pushing the boundaries of what's possible.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Values</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Innovation: Continuously seeking new and better ways to solve problems.</li>
        <li>Integrity: Operating with honesty and transparency in all our endeavors.</li>
        <li>Collaboration: Fostering a supportive environment where ideas flourish.</li>
        <li>User-Centricity: Designing with our users' needs and experiences at the forefront.</li>
        <li>Excellence: Striving for the highest quality in everything we do.</li>
      </ul>
      <p className="text-md">
        Join us on our journey to shape the future of digital interaction.
      </p>
    </div>
  )
}

export default AboutPage
