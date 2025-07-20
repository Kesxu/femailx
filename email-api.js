// Email API Integration Module

// Configuration for different email providers
const emailProviders = {
    gmail: {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        apiBaseUrl: 'https://gmail.googleapis.com/gmail/v1/users/me',
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
    },
    outlook: {
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        apiBaseUrl: 'https://graph.microsoft.com/v1.0/me/messages',
        scope: 'Mail.Read Mail.Send'
    },
    college: {
        // This would be replaced with your college email system's API endpoints
        authUrl: 'https://college-email-system.edu/auth',
        tokenUrl: 'https://college-email-system.edu/token',
        apiBaseUrl: 'https://college-email-system.edu/api/emails',
        scope: 'email:read email:send'
    }
};

// OAuth2 client configuration
const oauthConfig = {
    clientId: '818233475525-bt537rb2bcv7t5emi20539h768e5fjfo.apps.googleusercontent.com', // Inserted provided Gmail client ID
    redirectUri: window.location.origin, // Redirect back to this app
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent'
};

// Email API class
class EmailAPI {
    constructor(provider) {
        this.provider = provider;
        this.providerConfig = emailProviders[provider];
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        // Use Gmail OAuth token from localStorage if available
        if (provider === 'gmail') {
            this.accessToken = localStorage.getItem('gmail_access_token');
            this.refreshToken = localStorage.getItem('gmail_refresh_token');
            this.tokenExpiry = localStorage.getItem('gmail_token_expiry');
        }
    }

    // Initialize the connection process
    async connect(email, password) {
        // For OAuth providers (Gmail, Outlook)
        if (this.provider === 'gmail' || this.provider === 'outlook') {
            return this.initiateOAuth();
        }
        // For basic auth providers (like a college system that might use username/password)
        else {
            return this.authenticateWithCredentials(email, password);
        }
    }

    // Initiate OAuth flow
    initiateOAuth() {
        const authUrl = new URL(this.providerConfig.authUrl);
        authUrl.searchParams.append('client_id', oauthConfig.clientId);
        authUrl.searchParams.append('redirect_uri', oauthConfig.redirectUri);
        authUrl.searchParams.append('response_type', oauthConfig.responseType);
        authUrl.searchParams.append('scope', this.providerConfig.scope);
        authUrl.searchParams.append('access_type', oauthConfig.accessType);
        authUrl.searchParams.append('prompt', oauthConfig.prompt);

        // Open the auth URL in a popup or redirect
        window.location.href = authUrl.toString();
        
        // In a real implementation, you would handle the redirect back with the auth code
        // and then exchange it for tokens
    }

    // Authenticate with username/password (for systems that support it)
    async authenticateWithCredentials(email, password) {
        try {
            // This is a placeholder for actual API call
            // In a real implementation, you would make a secure POST request to the token endpoint
            console.log(`Authenticating ${email} with ${this.provider}...`);
            
            // Simulate API call
            const response = await this.simulateApiCall({
                url: this.providerConfig.tokenUrl,
                method: 'POST',
                body: {
                    email: email,
                    password: password
                }
            });
            
            if (response.success) {
                this.accessToken = response.accessToken;
                this.refreshToken = response.refreshToken;
                this.tokenExpiry = new Date().getTime() + (response.expiresIn * 1000);
                
                // Store tokens securely (in a real app, use secure storage)
                localStorage.setItem(`${this.provider}_access_token`, this.accessToken);
                localStorage.setItem(`${this.provider}_refresh_token`, this.refreshToken);
                localStorage.setItem(`${this.provider}_token_expiry`, this.tokenExpiry);
                
                return {
                    success: true,
                    email: email,
                    provider: this.provider
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Authentication failed'
                };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.message || 'Authentication failed'
            };
        }
    }

    // Fetch emails from the provider
    async fetchEmails(folder = 'inbox', limit = 50) {
        if (this.provider === 'gmail' && this.accessToken) {
            // Fetch emails from Gmail API
            try {
                // List messages
                const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&labelIds=${encodeURIComponent(folder === 'inbox' ? 'INBOX' : folder.toUpperCase())}`, {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                });
                const listData = await listRes.json();
                if (!listData.messages) {
                    return { success: true, emails: [] };
                }
                // Fetch details for each message
                const emails = await Promise.all(listData.messages.map(async (msg) => {
                    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
                        headers: { 'Authorization': `Bearer ${this.accessToken}` }
                    });
                    const msgData = await msgRes.json();
                    // Parse email fields
                    const headers = msgData.payload.headers.reduce((acc, h) => { acc[h.name] = h.value; return acc; }, {});
                    const body = msgData.payload.parts && msgData.payload.parts.length > 0
                        ? atob(msgData.payload.parts.find(p => p.mimeType === 'text/html' || p.mimeType === 'text/plain')?.body?.data || '')
                        : '';
                    return {
                        id: msgData.id,
                        sender: headers['From'] || '',
                        senderEmail: headers['From'] || '',
                        recipient: headers['To'] || '',
                        subject: headers['Subject'] || '',
                        body: body,
                        date: new Date(Number(msgData.internalDate)),
                        isRead: !(msgData.labelIds && msgData.labelIds.includes('UNREAD')),
                        hasAttachments: (msgData.payload.parts || []).some(p => p.filename),
                        isFlagged: (msgData.labelIds && msgData.labelIds.includes('STARRED')),
                        folder: folder,
                        attachments: (msgData.payload.parts || []).filter(p => p.filename).map(p => ({ name: p.filename, type: p.mimeType }))
                    };
                }));
                return { success: true, emails };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        try {
            // Check if token is valid, refresh if needed
            await this.ensureValidToken();
            
            // This is a placeholder for actual API call
            console.log(`Fetching emails from ${folder}...`);
            
            // Simulate API call
            const response = await this.simulateApiCall({
                url: `${this.providerConfig.apiBaseUrl}/messages`,
                method: 'GET',
                params: {
                    folder: folder,
                    limit: limit
                },
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.success) {
                return {
                    success: true,
                    emails: response.emails || []
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Failed to fetch emails'
                };
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch emails'
            };
        }
    }

    // Ensure we have a valid token, refresh if needed
    async ensureValidToken() {
        const now = new Date().getTime();
        if (!this.accessToken || !this.tokenExpiry || now >= this.tokenExpiry) {
            // Token is expired or missing, try to refresh
            if (this.refreshToken) {
                await this.refreshAccessToken();
            } else {
                throw new Error('No valid authentication token');
            }
        }
    }

    // Refresh the access token using the refresh token
    async refreshAccessToken() {
        try {
            // This is a placeholder for actual API call
            console.log('Refreshing access token...');
            
            // Simulate API call
            const response = await this.simulateApiCall({
                url: this.providerConfig.tokenUrl,
                method: 'POST',
                body: {
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                    client_id: oauthConfig.clientId
                }
            });
            
            if (response.success) {
                this.accessToken = response.accessToken;
                this.tokenExpiry = new Date().getTime() + (response.expiresIn * 1000);
                
                // Update stored token
                localStorage.setItem(`${this.provider}_access_token`, this.accessToken);
                localStorage.setItem(`${this.provider}_token_expiry`, this.tokenExpiry);
            } else {
                throw new Error(response.error || 'Failed to refresh token');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }

    // Send an email
    async sendEmail(to, subject, body, attachments = []) {
        try {
            // Check if token is valid, refresh if needed
            await this.ensureValidToken();
            
            // This is a placeholder for actual API call
            console.log(`Sending email to ${to}...`);
            
            // Simulate API call
            const response = await this.simulateApiCall({
                url: `${this.providerConfig.apiBaseUrl}/messages/send`,
                method: 'POST',
                body: {
                    to: to,
                    subject: subject,
                    body: body,
                    attachments: attachments
                },
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            return {
                success: response.success,
                error: response.error
            };
        } catch (error) {
            console.error('Error sending email:', error);
            return {
                success: false,
                error: error.message || 'Failed to send email'
            };
        }
    }

    // Simulate an API call (for demo purposes)
    simulateApiCall(config) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // For demo purposes, always succeed with mock data
                if (config.url.includes('token')) {
                    resolve({
                        success: true,
                        accessToken: 'mock_access_token_' + Math.random().toString(36).substring(7),
                        refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(7),
                        expiresIn: 3600 // 1 hour
                    });
                } else if (config.url.includes('messages') && config.method === 'GET') {
                    resolve({
                        success: true,
                        emails: generateMockEmails(config.params.folder, config.params.limit)
                    });
                } else if (config.url.includes('send') && config.method === 'POST') {
                    resolve({
                        success: true,
                        messageId: 'mock_message_id_' + Math.random().toString(36).substring(7)
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Invalid API call'
                    });
                }
            }, 1000); // Simulate network delay
        });
    }
}

// Generate mock emails for demo purposes
function generateMockEmails(folder, limit) {
    const emails = [];
    const senders = [
        { name: 'Financial Aid Office', email: 'financial.aid@college.edu' },
        { name: 'Professor Smith', email: 'smith@college.edu' },
        { name: 'Student Activities', email: 'activities@college.edu' },
        { name: 'Library', email: 'library@college.edu' },
        { name: 'Academic Advising', email: 'advising@college.edu' },
        { name: 'IT Services', email: 'it@college.edu' },
        { name: 'Career Center', email: 'careers@college.edu' },
        { name: 'Health Services', email: 'health@college.edu' }
    ];
    
    const subjects = {
        'inbox': [
            'Important: Scholarship Deadline Approaching',
            'Assignment #3 Feedback',
            'Campus Event: Tech Talk This Friday',
            'Book Return Reminder',
            'Registration for Fall Semester Opens Next Week',
            'IT Maintenance Notice',
            'Internship Opportunity',
            'Health Insurance Reminder'
        ],
        'important': [
            'URGENT: Financial Aid Form Due Tomorrow',
            'Final Exam Schedule Change',
            'Tuition Payment Deadline',
            'Graduation Application Deadline',
            'Required Course Registration'
        ],
        'classes': [
            'CS101: Homework #5 Posted',
            'MATH202: Midterm Review Session',
            'PHYS150: Lab Report Guidelines',
            'ENG220: Essay Deadline Extended',
            'CHEM101: Study Group Formation'
        ],
        'assignments': [
            'Research Paper Guidelines',
            'Group Project Update',
            'Lab Report Feedback',
            'Programming Assignment #4',
            'Presentation Schedule'
        ],
        'events': [
            'Career Fair Next Tuesday',
            'Guest Speaker: Tech Industry Leader',
            'Campus Concert This Weekend',
            'Student Club Fair',
            'Graduation Ceremony Details'
        ],
        'administrative': [
            'Tuition Statement Available',
            'Housing Selection Process',
            'Student ID Card Renewal',
            'Parking Permit Information',
            'Academic Calendar Updates'
        ]
    };
    
    // Use the appropriate subjects for the folder, or default to inbox
    const folderSubjects = subjects[folder.toLowerCase()] || subjects['inbox'];
    
    // Generate random emails
    for (let i = 0; i < Math.min(limit, 20); i++) {
        const sender = senders[Math.floor(Math.random() * senders.length)];
        const subject = folderSubjects[Math.floor(Math.random() * folderSubjects.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 14)); // Random date within last 2 weeks
        
        emails.push({
            id: 'email_' + Math.random().toString(36).substring(7),
            sender: sender.name,
            senderEmail: sender.email,
            recipient: 'your.email@college.edu',
            subject: subject,
            body: generateEmailBody(subject),
            date: date,
            folder: folder,
            isRead: Math.random() > 0.3, // 30% chance of being unread
            hasAttachments: Math.random() > 0.7, // 30% chance of having attachments
            attachments: Math.random() > 0.7 ? generateAttachments() : [],
            isFlagged: Math.random() > 0.8 // 20% chance of being flagged
        });
    }
    
    return emails;
}

// Generate a mock email body
function generateEmailBody(subject) {
    const greetings = ['Dear Student', 'Hello', 'Hi there', 'Greetings'];
    const closings = ['Best regards', 'Sincerely', 'Thank you', 'Regards', 'Best'];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const closing = closings[Math.floor(Math.random() * closings.length)];
    
    let body = `<p>${greeting},</p>`;
    
    // Generate paragraphs based on the subject
    if (subject.includes('Scholarship')) {
        body += `<p>This is a reminder that the deadline for submitting your scholarship application for the upcoming academic year is approaching soon.</p>`;
        body += `<p>Please ensure that all required documents are uploaded to your student portal before the deadline. Late applications will not be considered.</p>`;
        body += `<p>If you have any questions or need assistance with your application, please visit our office during business hours or reply to this email.</p>`;
    } else if (subject.includes('Assignment')) {
        body += `<p>I have reviewed your recent assignment submission and have provided feedback in the attached document.</p>`;
        body += `<p>Overall, your work demonstrates a good understanding of the concepts, but there are a few areas that could use improvement.</p>`;
        body += `<p>Please review my comments and let me know if you have any questions. Remember that you can revise and resubmit before the final deadline.</p>`;
    } else if (subject.includes('Event')) {
        body += `<p>We are excited to announce an upcoming event that might interest you.</p>`;
        body += `<p>Please mark your calendar and join us for this special occasion. Refreshments will be provided.</p>`;
        body += `<p>RSVP is required for attendance. Please respond to this email to confirm your participation.</p>`;
    } else {
        body += `<p>I hope this email finds you well. I'm writing to provide you with important information regarding your academic journey.</p>`;
        body += `<p>Please review the details below and take appropriate action as needed. If you have any questions, don't hesitate to reach out.</p>`;
        body += `<p>This information is important for your success at our institution.</p>`;
    }
    
    body += `<p>${closing},<br>`;
    body += subject.includes('Professor') ? 'Professor Smith' : (subject.includes('Financial') ? 'Financial Aid Office' : 'College Administration');
    body += `</p>`;
    
    return body;
}

// Generate mock attachments
function generateAttachments() {
    const attachmentTypes = ['pdf', 'docx', 'xlsx', 'jpg', 'png'];
    const attachmentNames = [
        'Scholarship_Guidelines',
        'Assignment_Feedback',
        'Event_Details',
        'Form_Instructions',
        'Schedule',
        'Requirements',
        'Information'
    ];
    
    const numAttachments = Math.floor(Math.random() * 2) + 1; // 1-2 attachments
    const attachments = [];
    
    for (let i = 0; i < numAttachments; i++) {
        const name = attachmentNames[Math.floor(Math.random() * attachmentNames.length)];
        const type = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
        
        attachments.push({
            id: 'attachment_' + Math.random().toString(36).substring(7),
            name: `${name}.${type}`,
            type: type,
            size: Math.floor(Math.random() * 5000) + 100 + 'KB' // Random size between 100KB and 5MB
        });
    }
    
    return attachments;
}

// Export the EmailAPI class
window.EmailAPI = EmailAPI;