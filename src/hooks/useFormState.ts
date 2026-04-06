import { useReducer } from 'react';
import {
  WizardState,
  PersonalDetails,
  GoalDetails,
  CalculationResults,
} from '../types/fitness';

const initialState: WizardState = {
  step: 1,
  personal: {
    name: '',
    age: '',
    gender: 'male',
    heightCm: '',
    weightKg: '',
    unitSystem: 'metric',
    heightFt: '',
    heightIn: '',
    weightLbs: '',
  },
  goals: {
    activityLevel: 'moderate',
    goal: 'lose',
    targetWeightKg: '',
    targetWeightLbs: '',
    surplus: 500,
  },
  results: null,
};

type Action =
  | { type: 'SET_PERSONAL'; payload: Partial<PersonalDetails> }
  | { type: 'SET_GOALS'; payload: Partial<GoalDetails> }
  | { type: 'SET_RESULTS'; payload: CalculationResults }
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 }
  | { type: 'RESET' };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'SET_PERSONAL':
      return { ...state, personal: { ...state.personal, ...action.payload } };
    case 'SET_GOALS':
      return { ...state, goals: { ...state.goals, ...action.payload } };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function useFormState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updatePersonal = (partial: Partial<PersonalDetails>) =>
    dispatch({ type: 'SET_PERSONAL', payload: partial });

  const updateGoals = (partial: Partial<GoalDetails>) =>
    dispatch({ type: 'SET_GOALS', payload: partial });

  const setResults = (results: CalculationResults) =>
    dispatch({ type: 'SET_RESULTS', payload: results });

  const goToStep = (step: 1 | 2 | 3) => dispatch({ type: 'SET_STEP', payload: step });

  const reset = () => dispatch({ type: 'RESET' });

  return { state, updatePersonal, updateGoals, setResults, goToStep, reset };
}
