import * as faceapi from "face-api.js";

export const isSamePerson = (currentDescriptor, descriptors) => {
  // A standard threshold for "same person" is 0.6.
  // By lowering it to 0.15, we only reject near-identical photos (e.g., burst shots with slightly different angles)
  // while allowing the same person in different outfits, makeup, or backgrounds.
  const threshold = 0.15;

  for (const descriptor of descriptors) {
    const distance = faceapi.euclideanDistance(currentDescriptor, descriptor);
    if (distance < threshold) {
      return true; // Same person found
    }
  }

  
  // Not a duplicate in the current batch, add to descriptors
  descriptors.push(currentDescriptor);
  return false;
};
