import { ActivityLevel } from '../types/fitness';

export const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    multiplier: 1.2,
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: '1–3 days/week',
    multiplier: 1.375,
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: '3–5 days/week',
    multiplier: 1.55,
  },
  {
    value: 'very',
    label: 'Very Active',
    description: '6–7 days/week',
    multiplier: 1.725,
  },
  {
    value: 'extra',
    label: 'Extra Active',
    description: 'Physical job or 2x training',
    multiplier: 1.9,
  },
];

export const MIN_CALORIES_MALE = 1500;
export const MIN_CALORIES_FEMALE = 1200;
