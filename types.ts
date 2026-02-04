import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Room {
  id: number;
  title: string;
  description: string;
  image: string;
  size: string;
  view: string;
}

export interface Amenity {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Review {
  id: number;
  author: string;
  text: string;
  rating: number;
}