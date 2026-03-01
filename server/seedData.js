const seedData = {
    employees: [
        {
            employee_id: 1,
            first_name: "Juan",
            last_name: "Dela Cruz",
            email: "juan@hr.com",
            department: "Operations",
            position: "Driver",
            employment_status: "Regular",
            date_hired: "2024-01-15",
            branch_location: "Manila Hub",
            is_active: 1
        },
        {
            employee_id: 2,
            first_name: "Jocath",
            last_name: "Tugas",
            email: "jocathgaslang@gmail.com",
            contact_number: "113",
            department: null,
            position: "Laborer",
            employment_status: "Probationary",
            date_hired: "2026-02-26",
            branch_location: "Manila Hub",
            is_active: 0
        },
        {
            employee_id: 3,
            first_name: "Maria",
            last_name: "Santos",
            email: "maria@test.com",
            department: null,
            position: "Manager",
            employment_status: "Probationary",
            date_hired: "2026-02-26",
            branch_location: "Cebu Hub",
            is_active: 0
        },
        {
            employee_id: 4,
            first_name: "Jocath",
            last_name: "asdasd",
            email: "jocath@gmail.com",
            contact_number: "",
            department: null,
            position: "Sorter",
            employment_status: "Probationary",
            date_hired: "2026-02-27",
            branch_location: "Cebu Hub",
            is_active: 1
        }
    ],
    users: [
        {
            name: "Admin User",
            email: "admin@hr.com",
            password_hash: "$2a$10$2PfyZTj71.xfuxKxdl5zi.i44UWlpr.Ug0fIFh2WXtbPfe534nuwS",
            role: "SuperAdmin",
            employee_id: null
        },
        {
            name: "Super Admin",
            email: "admin@gmail.com",
            password_hash: "$2a$10$6Bh3R3FYxoWt1PkqvwaZ7eDnKWNMl/ph1coiqInH1rB6LWqOW/KYO",
            role: "HRAdmin",
            employee_id: null
        },
        {
            name: "HR Admin",
            email: "hr@company.com",
            password_hash: "$2a$10$wBv37ndmMQWhKZeqxn7cwuBNkhxHiG40naX/SS3TEp9OFDylPn/Ba",
            role: "HRAdmin",
            employee_id: null
        },
        {
            name: "Maria Santos",
            email: "maria@test.com",
            password_hash: "$2a$10$AKuzv3aoSb888Dvn.8xRsec7G4yEE6nYkYq2MPQWY92cOe29yOMVm",
            role: "Employee",
            employee_id: 3
        },
        {
            name: "Juan Dela Cruz",
            email: "juan@hr.com",
            password_hash: "$2a$10$LXcEY16hS/98aRXKD6IqYejTBoO85/XJseHXMNzTp0/xl20k5lOrK",
            role: "Employee",
            employee_id: 1,
            temporary_password: "lPPG.&Tk|z<&9j"
        },
        {
            name: "Jocath asdasd",
            email: "jocath@gmail.com",
            password_hash: "$2a$10$STYvtiPmjzSqdfiPKqdD6eSm.nSd2kadFqdlxxjXIFU48C24r92.u",
            role: "Employee",
            employee_id: 4,
            temporary_password: "@at9UIc8Zx]I!L"
        }
    ]
};

module.exports = seedData;
