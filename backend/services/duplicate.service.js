// Similarity threshold — images with cosine similarity above this are considered near-duplicates.
// Configurable via environment variable. Default: 0.98 (only catches burst-shot near-identical images).
const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD ?? "0.98");

/**
 * Compute the cosine similarity between two normalized Float32Array vectors.
 * Since both vectors are already L2-normalized (from DINOv2 with normalize=true),
 * cosine similarity is just the dot product.
 *
 * @param {Float32Array} a
 * @param {Float32Array} b
 * @returns {number} Similarity score in [0, 1]
 */
const cosineSimilarity = (a, b) => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
};

/**
 * Check if the current embedding is a near-duplicate of any previously seen embedding.
 * If not a duplicate, the current embedding is pushed into seenEmbeddings for future comparisons.
 *
 * @param {Float32Array} currentEmbedding - Embedding of the image being processed
 * @param {Float32Array[]} seenEmbeddings  - Embeddings from images already processed in this request
 * @returns {boolean} true if this image is a near-duplicate
 */
export const isNearDuplicate = (currentEmbedding, seenEmbeddings) => {
  for (const seen of seenEmbeddings) {
    const similarity = cosineSimilarity(currentEmbedding, seen);
    if (similarity >= SIMILARITY_THRESHOLD) {
      return true;
    }
  }

  // Not a duplicate — register it for future comparisons
  seenEmbeddings.push(currentEmbedding);
  return false;
};
