// path: components/PhotosensitivityScreeningModal.tsx

/**
 * Photosensitivity Screening Modal
 * Guided questionnaire to estimate risk of photosensitive seizures
 * and gate high-intensity visual entrainment features.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import "../src/safety/accessibility.css";

export interface ScreeningQuestion {
  id: string;
  text: string;
  weight: number;
  category: "history" | "symptoms" | "triggers";
}

export interface ScreeningResult {
  riskLevel: "low" | "moderate" | "high";
  score: number;
  maxScore: number;
  recommendations: string[];
  shouldProceed: boolean;
  timestamp: number;
}

export interface PhotosensitivityScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: ScreeningResult) => void;
  allowSkip?: boolean;
}

const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  {
    id: "epilepsy_diagnosis",
    text: "Have you been diagnosed with epilepsy or any seizure disorder?",
    weight: 10,
    category: "history",
  },
  {
    id: "family_history",
    text: "Do you have a family history of epilepsy or photosensitive seizures?",
    weight: 7,
    category: "history",
  },
  {
    id: "past_seizures",
    text: "Have you ever experienced a seizure triggered by flashing lights or patterns?",
    weight: 10,
    category: "history",
  },
  {
    id: "light_sensitivity",
    text: "Do you experience discomfort, headaches, or dizziness from flashing lights?",
    weight: 5,
    category: "symptoms",
  },
  {
    id: "screen_sensitivity",
    text: "Have video games, movies, or strobe lights ever made you feel unwell?",
    weight: 6,
    category: "triggers",
  },
  {
    id: "pattern_sensitivity",
    text: "Do high-contrast patterns or geometric shapes make you uncomfortable?",
    weight: 4,
    category: "triggers",
  },
  {
    id: "medication",
    text: "Are you currently taking medication for seizures or epilepsy?",
    weight: 8,
    category: "history",
  },
  {
    id: "recent_episodes",
    text: "Have you noticed unusual visual symptoms in the last 6 months?",
    weight: 5,
    category: "symptoms",
  },
];

const RISK_THRESHOLDS = {
  low: 0,
  moderate: 15,
  high: 30,
};

export const PhotosensitivityScreeningModal: React.FC<
  PhotosensitivityScreeningModalProps
> = ({ isOpen, onClose, onComplete, allowSkip = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const maxScore = SCREENING_QUESTIONS.reduce(
    (total, q) => total + q.weight,
    0,
  );

  /**
   * Compute risk classification and recommendations.
   */
  const calculateRisk = useCallback((): ScreeningResult => {
    const score = SCREENING_QUESTIONS.reduce((total, q) => {
      return total + (answers[q.id] ? q.weight : 0);
    }, 0);

    let riskLevel: ScreeningResult["riskLevel"];
    let recommendations: string[];
    let shouldProceed: boolean;

    if (score >= RISK_THRESHOLDS.high) {
      riskLevel = "high";
      shouldProceed = false;
      recommendations = [
        "Consult with a neurologist before using visual entrainment.",
        "Prefer audio-only protocols over visual flicker.",
        "Avoid strobe-like effects, rapid flashes, and high-contrast patterns.",
        "Use the app only with supervision and in a well-lit room.",
      ];
    } else if (score >= RISK_THRESHOLDS.moderate) {
      riskLevel = "moderate";
      shouldProceed = true;
      recommendations = [
        "Enable photosensitivity protection in settings.",
        "Start with low-intensity visual effects and shorter sessions.",
        "Use in a well-lit environment and take breaks every 15–20 minutes.",
        "Stop immediately if you notice visual disturbance or discomfort.",
      ];
    } else {
      riskLevel = "low";
      shouldProceed = true;
      recommendations = [
        "You may proceed, but remain aware of how you feel.",
        "Prefer gradually increasing intensity instead of maximum presets.",
        "Stop and rest if you notice eye strain or headaches.",
      ];
    }

    return {
      riskLevel,
      score,
      maxScore,
      recommendations,
      shouldProceed,
      timestamp: Date.now(),
    };
  }, [answers, maxScore]);

  const handleAnswer = useCallback((questionId: string, answer: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < SCREENING_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      void (async () => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        const result = calculateRisk();
        onComplete(result);
        setIsSubmitting(false);
        onClose();
      })();
    }
  }, [currentStep, calculateRisk, onClose, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (!allowSkip) return;
    onComplete({
      riskLevel: "low",
      score: 0,
      maxScore,
      recommendations: [
        "Screening was skipped. Use visual features cautiously.",
        "Stop immediately if you experience any discomfort.",
      ],
      shouldProceed: true,
      timestamp: Date.now(),
    });
    onClose();
  }, [allowSkip, maxScore, onClose, onComplete]);

  // Focus trap + Esc handling
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (allowSkip) {
          handleSkip();
        } else {
          onClose();
        }
      }

      if (e.key === "Tab") {
        if (focusable.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    firstEl?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [allowSkip, handleSkip, isOpen, onClose]);

  if (!isOpen) return null;

  const currentQuestion = SCREENING_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / SCREENING_QUESTIONS.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <>
      <div
        className="modal-backdrop"
        aria-hidden="true"
        onClick={allowSkip ? handleSkip : undefined}
      />
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photosensitivity-screening-title"
        aria-describedby="photosensitivity-screening-description"
      >
        <header className="screening-header">
          <h2 id="photosensitivity-screening-title">
            Photosensitivity Screening
          </h2>
          <p
            id="photosensitivity-screening-description"
            className="screening-subtitle"
          >
            This quick check helps reduce the risk of visually induced
            discomfort or seizures. It should not replace professional
            medical advice.
          </p>

          <div
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={SCREENING_QUESTIONS.length}
            aria-label={`Question ${currentStep + 1} of ${
              SCREENING_QUESTIONS.length
            }`}
            className="progress-bar"
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            Question {currentStep + 1} of {SCREENING_QUESTIONS.length}
          </div>
        </header>

        <main className="screening-body">
          <section className="question-card">
            <h3 className="question-text">{currentQuestion.text}</h3>

            <div
              className="answer-buttons"
              role="group"
              aria-label="Answer options"
            >
              <button
                type="button"
                onClick={() => handleAnswer(currentQuestion.id, true)}
                className={`answer-button ${
                  answers[currentQuestion.id] === true ? "selected" : ""
                }`}
                aria-pressed={answers[currentQuestion.id] === true}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(currentQuestion.id, false)}
                className={`answer-button ${
                  answers[currentQuestion.id] === false ? "selected" : ""
                }`}
                aria-pressed={answers[currentQuestion.id] === false}
              >
                No
              </button>
            </div>
          </section>
        </main>

        <footer className="screening-footer">
          <div className="button-group">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="button secondary"
            >
              Back
            </button>

            {allowSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="button tertiary"
              >
                Skip screening
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!isAnswered || isSubmitting}
              className="button primary"
              aria-busy={isSubmitting}
            >
              {currentStep === SCREENING_QUESTIONS.length - 1
                ? isSubmitting
                  ? "Processing…"
                  : "Complete"
                : "Next"}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PhotosensitivityScreeningModal;
