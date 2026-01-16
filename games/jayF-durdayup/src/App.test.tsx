import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import App from './App';

// Mock child components to avoid complex rendering and isolate App logic
vi.mock('./components/LaserBackground', () => ({
    LaserBackground: () => <div data-testid="laser-background">Laser Background</div>,
}));

vi.mock('./components/IntroOverlay', () => ({
    IntroOverlay: ({ onStart }: { onStart: () => void }) => (
        <div data-testid="intro-overlay">
            Intro Overlay
            <button onClick={onStart}>Start</button>
        </div>
    ),
}));

vi.mock('./components/MediaPlayer', () => ({
    MediaPlayer: ({ gifSrc, audioSrc }: { gifSrc: string; audioSrc: string }) => (
        <div data-testid="media-player">
            Media Player: {gifSrc}, {audioSrc}
        </div>
    ),
}));

describe('App Component', () => {
    it('renders LaserBackground and IntroOverlay initially', () => {
        render(<App />);
        expect(screen.getByTestId('laser-background')).toBeInTheDocument();
        expect(screen.getByTestId('intro-overlay')).toBeInTheDocument();
        expect(screen.queryByTestId('media-player')).not.toBeInTheDocument();
    });

    it('renders MediaPlayer after starting', () => {
        render(<App />);

        // IntroOverlay should be present initially
        expect(screen.getByTestId('intro-overlay')).toBeInTheDocument();

        // Simulate clicking the start button in IntroOverlay
        fireEvent.click(screen.getByText('Start'));

        // IntroOverlay should disappear and MediaPlayer should appear
        expect(screen.queryByTestId('intro-overlay')).not.toBeInTheDocument();
        expect(screen.getByTestId('media-player')).toBeInTheDocument();

        // Verify props passed to MediaPlayer
        expect(screen.getByText('Media Player: animated_sprite_transparent.gif, assets/audio/Dwayne.mp3')).toBeInTheDocument();
    });
});
