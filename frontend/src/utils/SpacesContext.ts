import { createContext, useContext } from 'react';
import { DetailedSpace } from '../client/types';

export const SpacesContext = createContext<{ currentSpace?: DetailedSpace }>({});

