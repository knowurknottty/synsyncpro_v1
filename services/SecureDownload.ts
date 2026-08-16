
// Secure Download Service
// Handles retrieval of the obfuscated binary and client-side reassembly.

// The user has renamed the source file to 'neuromaxfull' (assuming .zip extension for functionality)
const TARGET_FILE = '/neuromaxfull.zip';

export const SecureDownloadService = {
    /**
     * Simulates verifying a license key against a backend.
     * In a real app, this would be an API call to your license server.
     */
    async verifyLicense(emailOrKey: string): Promise<boolean> {
        // Simulation: Accept any input that looks like an email or a key
        // This relies on the fact that they just came from Stripe.
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(emailOrKey.length > 5);
            }, 1500);
        });
    },

    /**
     * Fetches the file blob and triggers a browser download.
     * This hides the real path from the user's immediate view.
     */
    async downloadApp() {
        try {
            const response = await fetch(TARGET_FILE);
            if (!response.ok) throw new Error("Download source missing");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Friendly name for the user's file system
            a.download = "NeuroMax_Professional_Setup.zip"; 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error("Secure download failed:", error);
            return false;
        }
    }
};
