            export interface Inews {
                _id: string;
                title: string;
                img: string[];
                content: string;
                descriptions: string;
            }
            export type InewsLite = Pick<
            Inews,
                "_id" | "title" | "img" | "content" | "descriptions" 
            >;