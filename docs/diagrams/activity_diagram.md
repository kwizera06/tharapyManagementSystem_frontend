# Activity Diagram: Appointment Booking

```mermaid
activityDiagram
    start
    :Client logs in;
    :Navigate to Appointments;
    :Select Therapist;
    :Choose Date and Time;
    :Submit Booking Request;
    if (Therapist Available?) then (yes)
        :Create Appointment;
        :Send Notification to Therapist;
        :Show Success Message;
    else (no)
        :Show Error (Time Slot Taken);
        :Suggest Alternative Times;
    endif
    stop
```
