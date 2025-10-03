import React from 'react';

// A simple function to generate a color based on the username
const generateColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 75%, 60%)`;
  return color;
};

const Avatar = ({ username }) => {
  if (!username) return null;

  const initial = username.charAt(0).toUpperCase();
  const bgColor = generateColor(username);

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-xl font-bold">{initial}</span>
    </div>
  );
};

export default Avatar;