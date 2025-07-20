// DOM Elements
const connectBtn = document.getElementById('connect-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmail = document.getElementById('user-email');
const connectionModal = document.getElementById('connection-modal');
const connectionForm = document.getElementById('connection-form');
const closeModalBtns = document.querySelectorAll('.close-modal');
const cancelConnectBtn = document.getElementById('cancel-connect');
const signupLink = document.getElementById('signup-link');
const signupModal = document.getElementById('signup-modal');
const signupForm = document.getElementById('signup-form');
const cancelSignupBtn = document.getElementById('cancel-signup');
const closeSignupModalBtn = signupModal.querySelector('.close-modal');
const signupName = document.getElementById('signup-name');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirmPassword = document.getElementById('signup-confirm-password');
const signupProvider = document.getElementById('signup-provider');
const signupSubmitBtn = document.getElementById('signup-submit');
const loginLink = document.getElementById('login-link');
const addFolderBtn = document.getElementById('add-folder-btn');
const addFolderModal = document.getElementById('add-folder-modal');
const addFolderForm = document.getElementById('add-folder-form');
const cancelAddFolderBtn = document.getElementById('cancel-add-folder');
const folderList = document.getElementById('folder-list');
const emailItems = document.getElementById('email-items');
const selectAllCheckbox = document.getElementById('select-all');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dateRangeSelect = document.getElementById('date-range');
const unreadFilter = document.getElementById('unread-filter');
const attachmentsFilter = document.getElementById('attachments-filter');
const flaggedFilter = document.getElementById('flagged-filter');
const replyBtn = document.getElementById('reply-btn');
const forwardBtn = document.getElementById('forward-btn');
const archiveBtn = document.getElementById('archive-btn');
const deleteBtn = document.getElementById('delete-btn');

// State
let currentUser = null;
let emails = [];
let currentDate = new Date();
let users = [];
let folders = [
    { id: 1, name: 'Inbox', count: 5 },
    { id: 2, name: 'Important', count: 2 },
    { id: 3, name: 'Classes', count: 8 },
    { id: 4, name: 'Assignments', count: 3 },
    { id: 5, name: 'Events', count: 1 },
    { id: 6, name: 'Administrative', count: 4 }
];

// Load users from localStorage if available
const loadUsers = () => {
    const storedUsers = localStorage.getItem('femail_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
};

// Sample email data (for demonstration)
const sampleEmails = [
    {
        id: 1,
        sender: 'Financial Aid Office',
        senderEmail: 'financial.aid@college.edu',
        recipient: 'your.email@college.edu',
        subject: 'Important: Scholarship Deadline Approaching',
        body: `<p>Dear Student,</p>
               <p>This is a reminder that the deadline for submitting your scholarship application for the upcoming academic year is March 31, 2023.</p>
               <p>Please ensure that all required documents are uploaded to your student portal before the deadline. Late applications will not be considered.</p>
               <p>If you have any questions or need assistance with your application, please visit our office during business hours or reply to this email.</p>
               <p>Best regards,<br>Financial Aid Office</p>`,
        date: new Date(2023, 2, 16, 10, 30),
        isRead: false,
        hasAttachments: true,
        isFlagged: true,
        folder: 'Inbox',
        attachments: [
            { name: 'Scholarship_Guidelines.pdf', type: 'pdf' }
        ]
    },
    {
        id: 2,
        sender: 'Professor Smith',
        senderEmail: 'smith@college.edu',
        recipient: 'your.email@college.edu',
        subject: 'Assignment #3 Feedback',
        body: `<p>Hello,</p>
               <p>I've reviewed your submission for Assignment #3 and have provided detailed feedback in the attached document.</p>
               <p>Overall, your work was good, but there are a few areas that could use improvement. Please review my comments and let me know if you have any questions.</p>
               <p>Regards,<br>Professor Smith</p>`,
        date: new Date(2023, 2, 15, 14, 45),
        isRead: true,
        hasAttachments: true,
        isFlagged: false,
        folder: 'Classes',
        attachments: [
            { name: 'Assignment3_Feedback.docx', type: 'docx' }
        ]
    },
    {
        id: 3,
        sender: 'Student Activities',
        senderEmail: 'activities@college.edu',
        recipient: 'your.email@college.edu',
        subject: 'Campus Event: Tech Talk This Friday',
        body: `<p>Dear Students,</p>
               <p>We're excited to announce a Tech Talk event this Friday at 3:00 PM in the Student Center Auditorium.</p>
               <p>Our guest speaker will be Jane Doe, CTO of Tech Innovations Inc., who will discuss emerging trends in artificial intelligence and machine learning.</p>
               <p>Attendance is free for all students. Refreshments will be provided.</p>
               <p>We hope to see you there!</p>
               <p>Best,<br>Student Activities Office</p>`,
        date: new Date(2023, 2, 15, 9, 15),
        isRead: false,
        hasAttachments: false,
        isFlagged: false,
        folder: 'Events',
        attachments: []
    },
    {
        id: 4,
        sender: 'Library',
        senderEmail: 'library@college.edu',
        recipient: 'your.email@college.edu',
        subject: 'Book Return Reminder',
        body: `<p>Hello,</p>
               <p>This is a friendly reminder that the following books are due to be returned by March 20, 2023:</p>
               <ul>
                 <li>Introduction to Computer Science (ID: 12345)</li>
                 <li>Advanced Database Systems (ID: 67890)</li>
               </ul>
               <p>Please return them to the main desk or use the self-service return kiosk.</p>
               <p>Thank you,<br>College Library</p>`,
        date: new Date(2023, 2, 12, 11, 0),
        isRead: true,
        hasAttachments: false,
        isFlagged: false,
        folder: 'Administrative',
        attachments: []
    },
    {
        id: 5,
        sender: 'Academic Advising',
        senderEmail: 'advising@college.edu',
        recipient: 'your.email@college.edu',
        subject: 'Registration for Fall Semester Opens Next Week',
        body: `<p>Dear Student,</p>
               <p>Registration for the Fall 2023 semester will open on March 25, 2023. Your registration time slot is 10:00 AM.</p>
               <p>Please review the attached course catalog and prepare your schedule before your registration time. We recommend having backup courses in case your first choices are full.</p>
               <p>If you need assistance with course selection or have questions about degree requirements, please schedule an appointment with your academic advisor.</p>
               <p>Regards,<br>Academic Advising Office</p>`,
        date: new Date(2023, 2, 10, 13, 30),
        isRead: true,
        hasAttachments: true,
        isFlagged: true,
        folder: 'Important',
        attachments: [
            { name: 'Fall2023_Catalog.pdf', type: 'pdf' }
        ]
    }
];

// Calendar Functions
function renderCalendar() {
    const currentMonthElement = document.getElementById('current-month');
    const calendarDatesElement = document.getElementById('calendar-dates');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set current month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Clear previous dates
    calendarDatesElement.innerHTML = '';
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const prevMonthDays = new Date(year, month, 0).getDate();
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date other-month';
        dateDiv.textContent = prevMonthDays - firstDay + i + 1;
        calendarDatesElement.appendChild(dateDiv);
    }
    
    // Add current month dates
    for (let i = 1; i <= daysInMonth; i++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = i;
        
        // Check if date has events
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvents = emails.some(email => {
            const emailDate = new Date(email.date);
            return emailDate.toISOString().split('T')[0] === dateStr;
        });
        
        // Add appropriate classes
        if (hasEvents) {
            dateDiv.classList.add('has-events');
        }
        
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dateDiv.classList.add('today');
        }
        
        // Add click event to filter emails by date
        dateDiv.addEventListener('click', () => {
            const selectedDate = new Date(year, month, i);
            filterEmailsByDate(selectedDate);
        });
        
        calendarDatesElement.appendChild(dateDiv);
    }
    
    // Add empty cells for days after last day of month
    const totalCells = firstDay + daysInMonth;
    const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
    
    for (let i = 1; i <= remainingCells; i++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date other-month';
        dateDiv.textContent = i;
        calendarDatesElement.appendChild(dateDiv);
    }
}

function filterEmailsByDate(date) {
    const filteredEmails = emails.filter(email => {
        const emailDate = new Date(email.date);
        return emailDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
    });
    
    // Update email list with filtered results
    if (filteredEmails.length > 0) {
        renderEmailList(filteredEmails);
    } else {
        // Show no emails message
        showNoEmailsMessage(date);
    }
}

function showNoEmailsMessage(date) {
    emailItems.innerHTML = '';
    
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const noEmailsMessage = document.createElement('div');
    noEmailsMessage.className = 'no-emails-message';
    noEmailsMessage.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No emails for ${formattedDate}</h3>
            <p>There are no emails for this date. Try selecting another date.</p>
        </div>
    `;
    
    emailItems.appendChild(noEmailsMessage);
}

// Initialize the application
function init() {
    // Load users from localStorage
    loadUsers();
    
    // Check if we have a stored session
    const storedEmail = localStorage.getItem('user_email');
    const storedProvider = localStorage.getItem('user_provider');
    
    if (storedEmail && storedProvider) {
        // Try to reconnect using stored credentials
        // In a real app, you would use stored tokens instead of passwords
        // For demo purposes, we'll just update the UI
        currentUser = {
            email: storedEmail,
            provider: storedProvider
        };
        
        userEmail.textContent = storedEmail;
        connectBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        
        // Load emails (in a real app, this would fetch from the API)
        fetchEmails('Inbox');
    } else {
        // Load sample emails for demo
        emails = sampleEmails;
        renderEmails('Inbox', emails);
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial UI
    renderFolders();
    renderCalendar();
}

// Set up event listeners
function setupEventListeners() {
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Connect button
    connectBtn.addEventListener('click', () => {
        // Directly start Gmail OAuth flow
        const emailApi = new EmailAPI('gmail');
        emailApi.initiateOAuth();
    });
    
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            connectionModal.style.display = 'none';
            addFolderModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });
    
    // Cancel connect button
    cancelConnectBtn.addEventListener('click', () => {
        connectionModal.style.display = 'none';
    });
    
    // Signup link
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        connectionModal.style.display = 'none';
        signupModal.style.display = 'flex';
    });
    
    // Login link
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        connectionModal.style.display = 'flex';
    });
    
    // Cancel signup button
    cancelSignupBtn.addEventListener('click', () => {
        signupModal.style.display = 'none';
        signupForm.reset();
    });
    
    // Connection form submission
    connectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailAddress = document.getElementById('email-address').value;
        const emailPassword = document.getElementById('email-password').value;
        const emailProvider = document.getElementById('email-provider').value;
        
        // Check if user exists in our local database
        loadUsers();
        const userExists = users.find(user => user.email === emailAddress);
        
        if (!userExists) {
            alert('User not found. Please sign up first.');
            connectionModal.style.display = 'none';
            signupModal.style.display = 'flex';
            signupEmail.value = emailAddress;
            signupProvider.value = emailProvider;
            return;
        }
        
        // Verify password (in a real app, this would use proper password hashing)
        if (userExists.password !== emailPassword) {
            alert('Incorrect password. Please try again.');
            return;
        }
        
        // Show loading indicator
        const submitBtn = document.getElementById('connect-submit');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        submitBtn.disabled = true;
        
        // Connect to the email provider
        const success = await connectToEmailProvider(emailAddress, emailPassword, emailProvider);
        
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Close modal if successful
        if (success) {
            connectionModal.style.display = 'none';
        }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupName.value;
        const email = signupEmail.value;
        const password = signupPassword.value;
        const confirmPassword = signupConfirmPassword.value;
        const provider = signupProvider.value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }
        
        // Show loading state
        signupSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        signupSubmitBtn.disabled = true;
        
        try {
            // Load existing users
            loadUsers();
            
            // Check if user already exists
            if (users.some(user => user.email === email)) {
                alert('An account with this email already exists. Please log in.');
                signupModal.style.display = 'none';
                connectionModal.style.display = 'flex';
                document.getElementById('email-address').value = email;
                document.getElementById('email-provider').value = provider;
                return;
            }
            
            // Create new user
            const newUser = {
                name,
                email,
                password, // In a real app, this would be hashed
                provider,
                dateCreated: new Date().toISOString()
            };
            
            // Add to users array and save to localStorage
            users.push(newUser);
            localStorage.setItem('femail_users', JSON.stringify(users));
            
            // Connect to email provider
            await connectToEmailProvider(email, password, provider);
            
            // Close modal and reset form
            signupModal.style.display = 'none';
            signupForm.reset();
            
            alert('Account created successfully! You are now connected to your email.');
        } catch (error) {
            alert(`Account creation failed: ${error.message}`);
        } finally {
            // Reset button state
            signupSubmitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            signupSubmitBtn.disabled = false;
        }
    });
    
    // Add folder button
    addFolderBtn.addEventListener('click', () => {
        addFolderModal.style.display = 'flex';
    });
    
    // Cancel add folder button
    cancelAddFolderBtn.addEventListener('click', () => {
        addFolderModal.style.display = 'none';
    });
    
    // Add folder form submission
    addFolderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const folderName = document.getElementById('folder-name').value;
        const folderColor = document.getElementById('folder-color').value;
        
        // Add new folder to the list
        const newFolder = {
            id: folders.length + 1,
            name: folderName,
            count: 0,
            color: folderColor
        };
        
        folders.push(newFolder);
        renderFolders();
        addFolderModal.style.display = 'none';
    });
    
    // Select all checkbox
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.email-item .email-select input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        // Update selected class on email items
        const emailItems = document.querySelectorAll('.email-item');
        emailItems.forEach(item => {
            if (selectAllCheckbox.checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    });
    
    // Search button
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            const filteredEmails = emails.filter(email => 
                email.subject.toLowerCase().includes(searchTerm) || 
                email.sender.toLowerCase().includes(searchTerm) || 
                email.body.toLowerCase().includes(searchTerm)
            );
            renderFilteredEmails(filteredEmails);
        } else {
            // If search is empty, show current folder
            const activeFolder = document.querySelector('#folder-list li.active').textContent;
            renderEmails(activeFolder);
        }
    });
    
    // Search input enter key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Filter changes
    unreadFilter.addEventListener('change', applyFilters);
    attachmentsFilter.addEventListener('change', applyFilters);
    flaggedFilter.addEventListener('change', applyFilters);
    dateRangeSelect.addEventListener('change', applyFilters);
    
    // Email actions
    replyBtn.addEventListener('click', () => alert('Reply functionality would be implemented here'));
    forwardBtn.addEventListener('click', () => alert('Forward functionality would be implemented here'));
    archiveBtn.addEventListener('click', () => alert('Archive functionality would be implemented here'));
    deleteBtn.addEventListener('click', () => alert('Delete functionality would be implemented here'));
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        // Clear user data
        currentUser = null;
        
        // Update UI
        userEmail.textContent = 'Not connected';
        connectBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        
        // Clear stored session
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_provider');
        
        // Clear any provider-specific tokens
        const providers = ['gmail', 'outlook', 'college'];
        providers.forEach(provider => {
            localStorage.removeItem(`${provider}_access_token`);
            localStorage.removeItem(`${provider}_refresh_token`);
            localStorage.removeItem(`${provider}_token_expiry`);
        });
        
        // Load sample emails for demo
        emails = sampleEmails;
        renderEmails('Inbox', emails);
    });
}

// Render folders in the sidebar
async function renderFolders() {
    folderList.innerHTML = '';
    
    // If connected to a real email provider, try to fetch folders
    let foldersList = folders; // Default to predefined folders
    
    if (currentUser && currentUser.api) {
        try {
            // This would be implemented in a real API integration
            // For now, we'll use the predefined folders
            // In a real implementation, you would fetch folders from the API
            // const result = await currentUser.api.fetchFolders();
            // if (result.success) {
            //     foldersList = result.folders;
            // }
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    }
    
    foldersList.forEach(folder => {
        const li = document.createElement('li');
        
        // Add icon based on folder name
        let iconClass = 'fa-folder';
        if (folder.name === 'Inbox') iconClass = 'fa-inbox';
        if (folder.name === 'Important') iconClass = 'fa-star';
        if (folder.name === 'Classes') iconClass = 'fa-graduation-cap';
        if (folder.name === 'Assignments') iconClass = 'fa-tasks';
        if (folder.name === 'Events') iconClass = 'fa-calendar-alt';
        if (folder.name === 'Administrative') iconClass = 'fa-university';
        
        li.innerHTML = `<i class="fas ${iconClass}"></i>${folder.name}`;
        
        if (folder.name === 'Inbox') {
            li.classList.add('active');
        }
        
        li.addEventListener('click', () => {
            // Remove active class from all folders
            document.querySelectorAll('#folder-list li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked folder
            li.classList.add('active');
            
            // Fetch and render emails for the selected folder
            fetchEmails(folder.name);
        });
        
        folderList.appendChild(li);
    });
}

// Render emails for a specific folder
function renderEmails(folderName, emailList = null) {
    // If emailList is provided but empty, show no emails message
    if (emailList !== null && emailList.length === 0) {
        showNoEmailsMessage(new Date());
        return;
    }
    
    // Filter emails by folder if folderName is provided
    if (folderName) {
        const folderEmails = emailList ? emailList.filter(email => email.folder === folderName) : emails.filter(email => email.folder === folderName);
        renderEmailList(folderEmails);
    } else if (emailList) {
        // If no folder specified but emailList provided, render the emailList
        renderEmailList(emailList);
    } else {
        // Default to showing all emails
        renderEmailList(emails);
    }
}

// Render filtered emails
function renderFilteredEmails(filteredEmails) {
    renderEmailList(filteredEmails);
}

// Render email list
function renderEmailList(emailsToRender) {
    emailItems.innerHTML = '';
    
    emailsToRender.forEach(email => {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-item';
        if (!email.isRead) {
            emailItem.classList.add('unread');
        }
        
        emailItem.innerHTML = `
            <div class="email-select"><input type="checkbox"></div>
            <div class="email-sender">${email.sender}</div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-date">${formatDate(email.date)}</div>
        `;
        
        // Add click event to view email
        emailItem.addEventListener('click', (e) => {
            // Don't trigger if checkbox was clicked
            if (e.target.type !== 'checkbox') {
                viewEmail(email);
                
                // Mark as read
                email.isRead = true;
                emailItem.classList.remove('unread');
            }
        });
        
        // Add change event to checkbox
        const checkbox = emailItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                emailItem.classList.add('selected');
            } else {
                emailItem.classList.remove('selected');
            }
        });
        
        emailItems.appendChild(emailItem);
    });
}

// View email details
function viewEmail(email) {
    document.getElementById('view-subject').textContent = email.subject;
    document.getElementById('view-sender').textContent = `From: ${email.sender} <${email.senderEmail}>`;
    document.getElementById('view-recipient').textContent = `To: You <${email.recipient}>`;
    document.getElementById('view-date').textContent = formatFullDate(email.date);
    document.getElementById('view-body').innerHTML = email.body;
    
    // Handle attachments
    const attachmentsContainer = document.getElementById('view-attachments');
    if (email.hasAttachments && email.attachments.length > 0) {
        attachmentsContainer.style.display = 'block';
        const attachmentsList = document.createElement('div');
        
        email.attachments.forEach(attachment => {
            const attachmentItem = document.createElement('div');
            attachmentItem.className = 'attachment-item';
            
            let icon = '📄';
            if (attachment.type === 'pdf') icon = '📕';
            if (attachment.type === 'docx' || attachment.type === 'doc') icon = '📝';
            if (attachment.type === 'xlsx' || attachment.type === 'xls') icon = '📊';
            if (attachment.type === 'pptx' || attachment.type === 'ppt') icon = '📊';
            if (attachment.type === 'jpg' || attachment.type === 'png' || attachment.type === 'gif') icon = '🖼️';
            
            attachmentItem.innerHTML = `
                <span class="attachment-icon">${icon}</span>
                <span class="attachment-name">${attachment.name}</span>
                <button class="attachment-download">Download</button>
            `;
            
            attachmentsList.appendChild(attachmentItem);
        });
        
        // Clear previous attachments and add new ones
        attachmentsContainer.innerHTML = '<h3>Attachments</h3>';
        attachmentsContainer.appendChild(attachmentsList);
    } else {
        attachmentsContainer.style.display = 'none';
    }
}

// Apply filters to emails
function applyFilters() {
    const activeFolder = document.querySelector('#folder-list li.active').textContent;
    let filteredEmails = emails.filter(email => email.folder === activeFolder);
    
    // Apply unread filter
    if (unreadFilter.checked) {
        filteredEmails = filteredEmails.filter(email => !email.isRead);
    }
    
    // Apply attachments filter
    if (attachmentsFilter.checked) {
        filteredEmails = filteredEmails.filter(email => email.hasAttachments);
    }
    
    // Apply flagged filter
    if (flaggedFilter.checked) {
        filteredEmails = filteredEmails.filter(email => email.isFlagged);
    }
    
    // Apply date filter
    const dateRange = dateRangeSelect.value;
    if (dateRange !== 'all') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (dateRange === 'today') {
            filteredEmails = filteredEmails.filter(email => email.date >= startOfDay);
        } else if (dateRange === 'week') {
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            filteredEmails = filteredEmails.filter(email => email.date >= startOfWeek);
        } else if (dateRange === 'month') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            filteredEmails = filteredEmails.filter(email => email.date >= startOfMonth);
        }
    }
    
    renderEmailList(filteredEmails);
}

// Connect to email provider using the EmailAPI
async function connectToEmailProvider(email, password, provider) {
    try {
        // Create a new EmailAPI instance
        const emailApi = new EmailAPI(provider);
        
        // Attempt to connect
        const result = await emailApi.connect(email, password);
        
        if (result.success) {
            // Store the API instance and user info
            currentUser = {
                email: email,
                provider: provider,
                api: emailApi
            };
            
            // Update UI
            userEmail.textContent = email;
            connectBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            
            // Store session info for persistence
            localStorage.setItem('user_email', email);
            localStorage.setItem('user_provider', provider);
            
            // Fetch emails from the provider
            fetchEmails();
            
            return true;
        } else {
            alert(`Connection failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.error('Connection error:', error);
        alert(`Connection error: ${error.message || 'Unknown error'}`);
        return false;
    }
}

// Fetch emails from the connected provider
async function fetchEmails(folder = 'inbox') {
    try {
        if (!currentUser || !currentUser.api) {
            // If not connected, use sample data
            emails = sampleEmails;
            renderEmails(folder, emails);
            return;
        }
        
        // Show loading indicator
        emailItems.innerHTML = '<div class="loading">Loading emails...</div>';
        
        // Fetch emails from the provider
        const result = await currentUser.api.fetchEmails(folder);
        
        if (result.success) {
            emails = result.emails;
            renderEmails(folder, emails);
        } else {
            alert(`Failed to fetch emails: ${result.error}`);
            // Fall back to sample data
            emails = sampleEmails;
            renderEmails(folder, emails);
        }
    } catch (error) {
        console.error('Error fetching emails:', error);
        alert(`Error fetching emails: ${error.message || 'Unknown error'}`);
        // Fall back to sample data
        emails = sampleEmails;
        renderEmails(folder, emails);
    }
}

// Format date for email list
function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
        // Today, show time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
        // Yesterday
        return 'Yesterday';
    } else if (date.getFullYear() === now.getFullYear()) {
        // This year, show month and day
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
        // Different year, show year
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

// Format full date for email view
function formatFullDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString([], options);
}

// --- Gmail OAuth Code Exchange and Token Handling ---
(async function handleGmailOAuth() {
    // Helper to parse query params
    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    // Only run if redirected from Google with a code
    const code = getQueryParam('code');
    if (code && !localStorage.getItem('gmail_access_token')) {
        // Exchange code for tokens
        const clientId = '818233475525-bt537rb2bcv7t5emi20539h768e5fjfo.apps.googleusercontent.com';
        const clientSecret = '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'; // Added client secret
        const redirectUri = window.location.origin;
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const data = {
            code: code,
            client_id: clientId,
            client_secret: clientSecret, // Include client secret
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        };
        // Note: For public clients, client_secret is not required for browser apps
        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: Object.entries(data).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
            });
            const result = await response.json();
            if (result.access_token) {
                localStorage.setItem('gmail_access_token', result.access_token);
                if (result.refresh_token) localStorage.setItem('gmail_refresh_token', result.refresh_token);
                if (result.expires_in) localStorage.setItem('gmail_token_expiry', Date.now() + result.expires_in * 1000);
                // Remove code from URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Optionally, trigger email fetch
                window.location.reload();
            } else {
                alert('Failed to obtain Gmail access token.');
            }
        } catch (err) {
            alert('Error exchanging code for token: ' + err.message);
        }
    }
})();

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);