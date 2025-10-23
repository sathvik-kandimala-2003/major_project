export type MandatoryFields = {
  rank: number;
  preferredBranch: string;
  location: string;
  hostelReadiness: boolean;
};

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface UserInput {
  question: string;
  mandatoryFields: MandatoryFields;
}