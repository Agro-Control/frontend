export default function useFormattedDate(): (dateString: string | undefined) => string {
    return function formatDate(dateString: string | undefined): string {
      if (!dateString || typeof dateString !== 'string') {
        return "";
      }
      
      const date = new Date(dateString);
  
      if (isNaN(date.getTime())) {
        return "";
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
  
      return `${day}/${month}/${year}`;
    };
  }