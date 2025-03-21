
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Safely formats a date or timestamp
 * @param dateValue The date to format (number or Date)
 * @param formatString The format string to use
 * @returns Formatted date string or fallback message
 */
export const formatDate = (
  dateValue: number | string | Date | undefined, 
  formatString = 'PPP'
): string => {
  try {
    // Return default message if no date
    if (dateValue === undefined || dateValue === null) return 'Date inconnue';
    
    // Convert to Date object if it's not already
    const date = dateValue instanceof Date 
      ? dateValue
      : typeof dateValue === 'number'
        ? new Date(dateValue)
        : new Date(Number(dateValue));
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Date invalide';
    
    // Format the date
    return format(date, formatString, { locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date invalide';
  }
};
