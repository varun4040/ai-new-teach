import { ClassroomState, TextbookChapter } from '../types';
import { getLanguageDefinition } from './languages';

export class TeacherOrchestrator {
  static getSystemInstruction(state: ClassroomState, textbook?: TextbookChapter | null): string {
    const langDef = getLanguageDefinition(state.language);
    const textbookContext = textbook
      ? `
PRIMARY TEXTBOOK SOURCE OF TRUTH:
Document Name: ${textbook.fileName}
Chapter: ${textbook.chapterTitle} (Grade ${textbook.gradeClass})
Summary: ${textbook.summary}
Key Concepts in Textbook: ${textbook.keyConcepts.join(', ')}
Textbook Excerpt:
"${textbook.rawText.substring(0, 1500)}"

CRITICAL RULE FOR TEXTBOOK MODE:
- You must NOT rewrite character names, story sequence, or facts given in this textbook.
- Use this chapter as your primary source of lesson material.
`
      : 'No textbook uploaded. Use standard Class 2 Grade appropriate syllabus or universal question routing.';

    return `
YOU ARE MS. PRIYA, AN ENTHUSIASTIC, PATIENT, AND EXPERT UNIVERSAL ADAPTIVE TEACHER FOR YOUNG LEARNERS.

LEARNER PROFILE:
- Name: ${state.student.name}
- Age: ${state.student.age} years old
- Grade/Class: Class ${state.student.gradeClass}
- Subject: ${state.subject}
- Current Chapter: ${state.chapter}
- Current Concept: ${state.currentConcept}
- Target Lesson Objective: ${state.lessonObjective}
- Preferred Language Mode: ${langDef.name} (${langDef.nativeName})
- CRITICAL LANGUAGE RULE: ${langDef.promptInstruction} (If the child speaks or writes in any language, seamlessly understand them and reply warmly in ${langDef.name} / ${langDef.nativeName}).

UNIVERSAL ADAPTIVE TEACHING LOOP:
1. Understand → Assess → Explain → Visualize → Ask → Evaluate → Diagnose misconception → Adapt → Update mastery.
2. DO NOT BECOME A GENERIC CHATBOT! Every answer must be converted into age-appropriate elementary teaching.
3. Keep spoken sentences short (1-3 sentences max per turn).
4. Ask one simple question at a time and WAIT for the child to answer.
5. Praise appropriately ("Great try!", "Super star!", "You got it!"). Never shame wrong answers.
6. ADAPTIVE STRATEGY: If the student fails to understand or answers incorrectly, NEVER repeat the same explanation. Switch strategy (e.g. from direct explanation to visual example, story, or simpler analogy) and update the whiteboard.
7. Use concrete visual examples: apples 🍎, stars ⭐, balloons 🎈, cookies 🍪, pencils ✏️, diagrams, timelines, and flashcards.

${textbookContext}

WHITEBOARD FUNCTION CALLS AVAILABLE:
You MUST call tool functions whenever explaining, showing diagrams, timelines, tables, flashcards, objects, number lines, equations, or testing the child!
Tools available:
- show_objects({ object: 'apple'|'star'|'cookie'|'balloon'|'pencil'|'ball'|'block', count: number, label?: string, group1?: number, group2?: number, symbol?: '+'|'-' })
- draw_number_line({ min: number, max: number, highlightNumber?: number, marks?: number[] })
- show_equation({ equation: string, steps?: string[] })
- show_text({ text: string, title?: string, highlight?: string })
- show_image({ preset?: 'fractions'|'shapes'|'clock'|'solar_system'|'plant'|'coins', prompt?: string, url?: string, caption?: string })
- show_diagram({ title: string, nodes: [{ id: string, label: string, type?: string }], links?: [{ from: string, to: string, label?: string }] })
- show_timeline({ title: string, events: [{ date: string, title: string, description: string }] })
- show_table({ title: string, headers: string[], rows: string[][] })
- show_flashcards({ title: string, front: string, back: string, hint?: string })
- show_multiple_choice({ question: string, options: string[], answerIndex?: number })
- point_to_element({ target?: string, x?: number, y?: number, label?: string, pointerType?: 'hand'|'laser'|'magic_wand'|'spotlight', color?: string })
- start_quiz({ title: string, questions: [{ question: string, options: string[], answerIndex: number }] })
- check_answer({ isCorrect: boolean, feedback: string })
- clear_board()

Remember: Speak warmly, naturally, like a real teacher sitting with a child in a classroom!
`;
  }

  static getToolDeclarations() {
    return [
      {
        name: 'show_objects',
        description: 'Display countable 3D/vector objects on the whiteboard, e.g. apples, stars, cookies.',
        parameters: {
          type: 'OBJECT',
          properties: {
            object: {
              type: 'STRING',
              description: 'Type of object: apple, star, cookie, balloon, pencil, ball, or block',
            },
            count: { type: 'NUMBER', description: 'Total number of objects to display (1-20)' },
            label: { type: 'STRING', description: 'Caption label to show on whiteboard' },
            group1: { type: 'NUMBER', description: 'First group count for addition, e.g. 5' },
            group2: { type: 'NUMBER', description: 'Second group count for addition, e.g. 3' },
            symbol: { type: 'STRING', description: 'Operation symbol, e.g. +' },
          },
          required: ['object', 'count'],
        },
      },
      {
        name: 'draw_number_line',
        description: 'Draw an interactive number line on the digital whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            min: { type: 'NUMBER', description: 'Minimum number, e.g. 0' },
            max: { type: 'NUMBER', description: 'Maximum number, e.g. 10 or 20' },
            highlightNumber: { type: 'NUMBER', description: 'Specific number to highlight or place pointer on' },
            label: { type: 'STRING', description: 'Label title for number line' },
          },
          required: ['min', 'max'],
        },
      },
      {
        name: 'show_equation',
        description: 'Display a math equation with step-by-step breakdown on whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            equation: { type: 'STRING', description: 'Math equation, e.g. "5 + 3 = 8"' },
            steps: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Step by step hints' },
          },
          required: ['equation'],
        },
      },
      {
        name: 'show_text',
        description: 'Write a headline, key rule, or story excerpt on the whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Main text message to display' },
            title: { type: 'STRING', description: 'Title header' },
            highlight: { type: 'STRING', description: 'Text phrase to highlight in yellow' },
          },
          required: ['text'],
        },
      },
      {
        name: 'show_image',
        description: 'Show an educational diagram, preset illustration, or generate an AI image on the whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            preset: {
              type: 'STRING',
              description: 'Optional preset diagram: fractions, shapes, clock, solar_system, plant, coins',
            },
            prompt: {
              type: 'STRING',
              description: 'Text prompt to generate a custom educational illustration using Gemini Imagen model',
            },
            url: {
              type: 'STRING',
              description: 'Direct image URL if available',
            },
            caption: { type: 'STRING', description: 'Explanation caption under diagram' },
          },
        },
      },
      {
        name: 'show_diagram',
        description: 'Show an interactive conceptual diagram or flowchart on the whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Diagram title' },
            nodes: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  label: { type: 'STRING' },
                  type: { type: 'STRING' },
                },
                required: ['id', 'label'],
              },
              description: 'Nodes in diagram',
            },
            links: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  from: { type: 'STRING' },
                  to: { type: 'STRING' },
                  label: { type: 'STRING' },
                },
                required: ['from', 'to'],
              },
              description: 'Connections between nodes',
            },
          },
          required: ['title', 'nodes'],
        },
      },
      {
        name: 'show_timeline',
        description: 'Show a historical or process timeline on the whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Timeline title' },
            events: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  date: { type: 'STRING' },
                  title: { type: 'STRING' },
                  description: { type: 'STRING' },
                },
                required: ['date', 'title', 'description'],
              },
            },
          },
          required: ['title', 'events'],
        },
      },
      {
        name: 'show_table',
        description: 'Show a structured comparison or data table on the whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Table title' },
            headers: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Table column headers' },
            rows: {
              type: 'ARRAY',
              items: { type: 'ARRAY', items: { type: 'STRING' } },
              description: 'Table rows data',
            },
          },
          required: ['title', 'headers', 'rows'],
        },
      },
      {
        name: 'show_flashcards',
        description: 'Show an educational flashcard on the whiteboard for quick memory recall.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Flashcard subject title' },
            front: { type: 'STRING', description: 'Question or term on front' },
            back: { type: 'STRING', description: 'Answer or definition on back' },
            hint: { type: 'STRING', description: 'Helpful hint for student' },
          },
          required: ['title', 'front', 'back'],
        },
      },
      {
        name: 'show_multiple_choice',
        description: 'Display an interactive multiple choice question for the student.',
        parameters: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING', description: 'Question prompt' },
            options: { type: 'ARRAY', items: { type: 'STRING' }, description: '4 choice options' },
            answerIndex: { type: 'NUMBER', description: '0-based index of correct option' },
          },
          required: ['question', 'options'],
        },
      },
      {
        name: 'point_to_element',
        description: 'Highlight or place a visual pointer (laser dot, pointing hand, or magic wand) on specific parts of the whiteboard during explanations.',
        parameters: {
          type: 'OBJECT',
          properties: {
            target: { type: 'STRING', description: 'Target element or topic name, e.g. "step_1", "option_2", "objects", "number_line", "title"' },
            x: { type: 'NUMBER', description: 'Relative horizontal position percentage on whiteboard (0 to 100)' },
            y: { type: 'NUMBER', description: 'Relative vertical position percentage on whiteboard (0 to 100)' },
            label: { type: 'STRING', description: 'Voice/tooltip caption explaining what Ms. Priya is pointing at' },
            pointerType: { type: 'STRING', description: 'Visual style: "hand", "laser", "magic_wand", or "spotlight"' },
            color: { type: 'STRING', description: 'Highlight color hex or name' },
          },
        },
      },
      {
        name: 'clear_board',
        description: 'Clear all contents from the digital whiteboard.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
      {
        name: 'check_answer',
        description: 'Report whether student answer was correct and show praise/feedback.',
        parameters: {
          type: 'OBJECT',
          properties: {
            isCorrect: { type: 'BOOLEAN' },
            feedback: { type: 'STRING', description: 'Praise or gentle correction message' },
          },
          required: ['isCorrect', 'feedback'],
        },
      },
    ];
  }
}

