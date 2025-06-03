declare module 'string-similarity' {
  export interface BestMatch {
    target: string;
    rating: number;
  }
  export interface BestMatchResult {
    ratings: BestMatch[];
    bestMatch: BestMatch;
    bestMatchIndex: number;
  }
  export function compareTwoStrings(str1: string, str2: string): number;
  export function findBestMatch(mainString: string, targetStrings: string[]): BestMatchResult;
}
