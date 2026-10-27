#!/usr/bin/env python3
"""
HTMX + Tyrell Web Components Example

A Flask application demonstrating how to use Tyrell web components
with HTMX for dynamic, server-rendered interactions.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
from markupsafe import escape
from flask_compress import Compress
from datetime import datetime, timedelta
import json
import random

app = Flask(__name__)
app.secret_key = "demo-key-change-in-production"

# Configure gzip compression
compress = Compress()
compress.init_app(app)

# Compression configuration
app.config['COMPRESS_MIMETYPES'] = [
    'text/html', 'text/css', 'text/xml',
    'application/json', 'application/javascript',
    'application/xml+rss', 'application/atom+xml',
    'text/javascript', 'image/svg+xml'
]
app.config['COMPRESS_LEVEL'] = 6
app.config['COMPRESS_MIN_SIZE'] = 500

# tyrell-components version loaded from jsDelivr (base.html)
TYRELL_VERSION = "1.0.0-RC18"

# Month names for calendar functionality - FIXES month_names UndefinedError
MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

# Global template context processor - ensures month_names is always available
@app.context_processor
def inject_global_vars():
    """Inject global variables into all templates to prevent UndefinedError"""
    current_date = datetime.now()
    return {
        'month_names': MONTH_NAMES,
        'current_year': current_date.year,
        'current_month': current_date.month,
        'current_day': current_date.day,
        'tyrell_version': TYRELL_VERSION,
    }

# Sample data for demonstrations
SAMPLE_USERS = [
    {"id": 1, "name": "Alice Johnson", "email": "alice@example.com", "role": "Admin"},
    {"id": 2, "name": "Bob Smith", "email": "bob@example.com", "role": "User"},
    {"id": 3, "name": "Carol Williams", "email": "carol@example.com", "role": "Editor"},
    {"id": 4, "name": "David Brown", "email": "david@example.com", "role": "User"},
    {"id": 5, "name": "Eva Davis", "email": "eva@example.com", "role": "Admin"},
]

SAMPLE_TASKS = [
    {
        "id": 1,
        "title": "Design new homepage",
        "priority": "high",
        "status": "in-progress",
    },
    {"id": 2, "title": "Fix login bug", "priority": "critical", "status": "pending"},
    {
        "id": 3,
        "title": "Update documentation",
        "priority": "low",
        "status": "completed",
    },
    {
        "id": 4,
        "title": "Optimize database queries",
        "priority": "medium",
        "status": "pending",
    },
]

# In-memory storage for demo (use a real database in production)
form_submissions = []
selected_dates = []

# Event scheduler storage
user_events = {}  # Format: {"2025-01-15": [event1, event2, ...]}
event_counter = 1

# Event type configuration
EVENT_TYPES = {
    "meeting": {"icon": "users", "color": "primary", "name": "Meeting"},
    "deadline": {"icon": "calendar-x", "color": "danger", "name": "Deadline"}, 
    "personal": {"icon": "user", "color": "primary", "name": "Personal"},
    "reminder": {"icon": "bell", "color": "warning", "name": "Reminder"}
}

# Add some demo events to show persistence
def initialize_demo_events():
    """Add some sample events to demonstrate persistence."""
    global event_counter, user_events
    
    demo_events = [
        {
            "date": "2025-01-15",
            "title": "Team Standup",
            "type": "meeting",
            "time": "9:00 AM"
        },
        {
            "date": "2025-01-15", 
            "title": "Project Deadline",
            "type": "deadline",
            "time": "5:00 PM"
        },
        {
            "date": "2025-01-20",
            "title": "Doctor Appointment", 
            "type": "personal",
            "time": "2:00 PM"
        },
        {
            "date": "2025-01-20",
            "title": "Call Mom",
            "type": "reminder",
            "time": "7:00 PM"
        }
    ]
    
    for demo_event in demo_events:
        date_str = demo_event["date"]
        type_config = EVENT_TYPES.get(demo_event["type"], EVENT_TYPES["personal"])
        
        # Format date for display
        from datetime import datetime
        date_obj = datetime.fromisoformat(date_str)
        formatted_date = date_obj.strftime("%A, %B %d, %Y")
        
        event = {
            "id": event_counter,
            "title": demo_event["title"],
            "date": date_str,
            "formatted_date": formatted_date,
            "type": demo_event["type"],
            "icon": type_config["icon"],
            "color": type_config["color"],
            "name": type_config["name"],
            "time": demo_event.get("time"),
            "created_at": datetime.now().isoformat()
        }
        
        if date_str not in user_events:
            user_events[date_str] = []
        user_events[date_str].append(event)
        event_counter += 1

# Initialize demo events on startup
initialize_demo_events()


@app.route("/")
def index():
    """Home page showcasing various Tyrell components."""
    return render_template("index.html", users=SAMPLE_USERS[:5], tasks=SAMPLE_TASKS)


@app.route("/forms")
def forms():
    """Form examples with Tyrell components."""
    return render_template(
        "forms.html",
        values={"skills": ["python", "react"]},
        errors={},
        success=None,
        skill_options=SKILL_OPTIONS,
    )


@app.route("/calendar")
def calendar():
    """Calendar component demonstrations."""
    # Generate initial events for current month
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month
    
    # Set random seed for consistent demo events
    random.seed(current_year * 100 + current_month)
    
    # Generate some sample events for the current month
    initial_events = []
    event_types = [
        {"title": "Team Meeting", "icon": "users", "color": "primary", "time": "10:00 AM"},
        {"title": "Code Review", "icon": "code", "color": "primary", "time": "2:00 PM"},
        {"title": "Client Call", "icon": "phone", "color": "success", "time": "3:30 PM"},
        {"title": "Project Deadline", "icon": "calendar-x", "color": "danger", "time": "11:59 PM"},
        {"title": "Workshop", "icon": "book-open", "color": "warning", "time": "9:00 AM"},
        {"title": "Planning Session", "icon": "target", "color": "neutral", "time": "1:00 PM"},
    ]
    
    # Ensure we have at least 3 events
    guaranteed_days = [5, 12, 20]  # Days that will always have events
    for day in guaranteed_days:
        event_data = random.choice(event_types)
        initial_events.append({
            "day": day,
            "date": f"{current_year}-{current_month:02d}-{day:02d}",
            **event_data
        })
    
    # Add some random events
    for day in range(1, 29):
        if day not in guaranteed_days and random.random() < 0.25:  # 25% chance for other days
            event_data = random.choice(event_types)
            initial_events.append({
                "day": day,
                "date": f"{current_year}-{current_month:02d}-{day:02d}",
                **event_data
            })
    # Sort events by day
    initial_events.sort(key=lambda x: x["day"])
    
    # Debug: Print events count for current month
    print(f"📅 Calendar route: Generated {len(initial_events)} events for {current_month}/{current_year}")
    
    return render_template("calendar.html", 
                         initial_events=initial_events,
                         current_month=current_month,
                         current_year=current_year)


@app.route("/components")
def components():
    """Individual component showcase."""
    return render_template("components.html")


@app.route("/modals")
def modals():
    """Modal examples with HTMX integration."""
    return render_template("modals.html", users=SAMPLE_USERS[:3], tasks=SAMPLE_TASKS[:4])


# HTMX API endpoints


@app.route("/api/users/search")
def search_users():
    """Search users for dropdown/multiselect components."""
    query = request.args.get("q", "").lower()
    filtered_users = [
        user
        for user in SAMPLE_USERS
        if query in user["name"].lower() or query in user["email"].lower()
    ]
    return render_template("partials/user_search_results.html", users=filtered_users)


@app.route("/api/users/<int:user_id>/contact", methods=["POST"])
def contact_user(user_id):
    """Pretend to message a user from their profile modal."""
    user = next((u for u in SAMPLE_USERS if u["id"] == user_id), None)
    if not user:
        return "User not found", 404
    return f"""
    <div class="ty-bg-success- rounded-lg p-3 text-sm ty-text-success++ animate-fade-in">
        Message sent to {escape(user["name"])}.
    </div>
    """


@app.route("/api/tasks/filter")
def filter_tasks():
    """Filter tasks by status or priority."""
    status = request.args.get("status")
    priority = request.args.get("priority")
    
    # Debug logging
    print(f"=== TASK FILTER DEBUG ===")
    print(f"Status filter: '{status}'")
    print(f"Priority filter: '{priority}'")
    print(f"All request args: {dict(request.args)}")

    filtered_tasks = SAMPLE_TASKS
    if status:
        filtered_tasks = [t for t in filtered_tasks if t["status"] == status]
        print(f"After status filter: {len(filtered_tasks)} tasks")
    if priority:
        filtered_tasks = [t for t in filtered_tasks if t["priority"] == priority]
        print(f"After priority filter: {len(filtered_tasks)} tasks")
    
    print(f"Final filtered tasks: {[t['title'] for t in filtered_tasks]}")
    print("========================")

    return render_template("partials/task_list.html", tasks=filtered_tasks)


@app.route("/api/tasks/<int:task_id>/toggle", methods=["POST"])
def toggle_task(task_id):
    """Toggle task completion status."""
    task = next((t for t in SAMPLE_TASKS if t["id"] == task_id), None)
    if task:
        task["status"] = "completed" if task["status"] != "completed" else "pending"
    return render_template("partials/task_item.html", task=task)


@app.route("/api/test-debug")
def test_debug():
    """Test endpoint for HTMX debugging."""
    print("=== TEST DEBUG ENDPOINT ===")
    print(f"Request method: {request.method}")
    print(f"Headers: {dict(request.headers)}")
    print("===========================")

    return """
    <div class="ty-bg-success- p-3 rounded text-sm">
        <ty-icon name="check-circle" class="inline mr-1 ty-text-success"></ty-icon>
        <strong>Debug test successful!</strong> Check console for HTMX logs.
        <br><small class="ty-text-success+">Timestamp: {}</small>
    </div>
    """.format(datetime.now().strftime("%H:%M:%S"))


SKILL_OPTIONS = [
    ("javascript", "JavaScript", "warning"),
    ("python", "Python", "primary"),
    ("react", "React", "primary"),
    ("vue", "Vue.js", "success"),
    ("node", "Node.js", "success"),
    ("docker", "Docker", "neutral"),
    ("aws", "AWS", "warning"),
    ("design", "UI/UX Design", "danger"),
]

TAKEN_EMAILS = {user["email"] for user in SAMPLE_USERS}


def render_signup_form(values=None, errors=None, success=None):
    return render_template(
        "partials/signup_form.html",
        values=values or {"skills": []},
        errors=errors or {},
        success=success,
        skill_options=SKILL_OPTIONS,
    )


@app.route("/api/form/validate", methods=["POST"])
def validate_form():
    """The browser already enforced required/type/minlength/min/max. The
    server repeats them (never trust the client) and adds what only it can
    know, then re-renders the form with `error` on the failing fields."""
    values = {
        "name": request.form.get("name", "").strip(),
        "email": request.form.get("email", "").strip(),
        "age": request.form.get("age", "").strip(),
        "role": request.form.get("role", ""),
        "skills": request.form.getlist("skills"),
    }
    errors = {}

    if len(values["name"]) < 2:
        errors["name"] = "Name must be at least 2 characters"

    if "@" not in values["email"]:
        errors["email"] = "Please enter a valid email address"
    elif values["email"].lower() in TAKEN_EMAILS:
        errors["email"] = "That email already has an account"

    if values["age"]:
        try:
            if not 13 <= int(float(values["age"])) <= 120:
                errors["age"] = "Age must be between 13 and 120"
        except ValueError:
            errors["age"] = "Age must be a number"

    if errors:
        return render_signup_form(values, errors)

    form_submissions.append({**values, "timestamp": datetime.now().isoformat()})
    return render_signup_form(success=values["name"])


def generate_month_events_data(year, month):
    """Shared function to generate consistent event data for a month."""
    import calendar
    import hashlib
    
    # Get number of days in the month
    _, days_in_month = calendar.monthrange(year, month)
    
    # Event types available
    event_types = [
        {"title": "Team Meeting", "icon": "users", "color": "primary", "time": "10:00 AM"},
        {"title": "Code Review", "icon": "code", "color": "primary", "time": "2:00 PM"},
        {"title": "Client Call", "icon": "phone", "color": "success", "time": "3:30 PM"},
        {"title": "Project Deadline", "icon": "calendar-x", "color": "danger", "time": "11:59 PM"},
        {"title": "Workshop", "icon": "book-open", "color": "warning", "time": "9:00 AM"},
        {"title": "Planning Session", "icon": "target", "color": "neutral", "time": "1:00 PM"},
    ]
    
    events_by_day = {}
    
    # Generate consistent event data for each day in the month
    for day in range(1, days_in_month + 1):
        date_str = f"{year}-{month:02d}-{day:02d}"
        
        # Use date as seed for consistent results
        seed = int(hashlib.md5(date_str.encode()).hexdigest()[:8], 16)
        random.seed(seed)
        
        event_count = random.randint(0, 3)
        
        # Generate detailed events for this day
        day_events = []
        for i in range(event_count):
            event_data = random.choice(event_types)
            day_events.append({
                "day": day,
                "date": date_str,
                **event_data
            })
        
        if day_events:
            events_by_day[date_str] = day_events
    
    return events_by_day


@app.route("/api/calendar/events")
def calendar_events():
    """Get calendar events for a specific month - returns JSON for component-native rendering."""
    year = int(request.args.get("year", datetime.now().year))
    month = int(request.args.get("month", datetime.now().month))

    # Use shared event generation function
    events_by_day = generate_month_events_data(year, month)
    
    # Flatten to a simple list with proper structure for client-side rendering
    events_list = []
    for date_str, day_events in events_by_day.items():
        events_list.extend(day_events)
    
    # Sort events by day
    events_list.sort(key=lambda x: x["day"])

    # Debug: Print events count for API call
    print(f"🌐 API call: Generated {len(events_list)} events for {month}/{year}")

    # Return JSON data for client-side rendering
    return {
        "events": events_list,
        "month": month,
        "year": year,
        "total_count": len(events_list)
    }
@app.route("/api/date/select", methods=["POST"])
def select_date():
    """Handle date selection from calendar."""
    date_str = request.form.get("date")
    
    # Debug logging
    print(f"=== CALENDAR DATE SELECT DEBUG ===")
    print(f"Raw date received: '{date_str}'")
    print(f"All form data: {dict(request.form)}")
    print("================================")
    
    if date_str:
        try:
            # Parse and format the date nicely
            from datetime import datetime
            date_obj = datetime.fromisoformat(date_str)
            formatted_date = date_obj.strftime("%A, %B %d, %Y")
            
            selected_dates.append(
                {"date": date_str, "formatted": formatted_date, "timestamp": datetime.now().isoformat()}
            )
            return render_template("partials/selected_date.html", date=formatted_date)
        except Exception as e:
            print(f"Date parsing error: {e}")
            return f"<p class='ty-text-danger'>Error processing date: {str(e)}</p>", 400
    
    print("No date received!")
    return "<p class='ty-text-danger'>No date received</p>", 400


@app.route("/api/calendar/date-select", methods=["POST"])
def calendar_date_select():
    """Handle calendar page date selection with server response."""
    # Get date from the custom date-select event
    date_value = request.form.get("date-value")  # timestamp
    date_str = request.form.get("date")  # ISO date string

    if not date_str:
        return "<p class='ty-text-danger'>❌ No date received</p>"

    try:
        # Parse the date
        from datetime import datetime

        date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))

        # Format for display
        formatted_date = date_obj.strftime("%A, %B %d, %Y")

        # Simulate some server processing
        import random

        processing_time = random.uniform(0.1, 0.5)
        import time

        time.sleep(processing_time)

        # Generate response
        day_name = date_obj.strftime("%A")
        is_weekend = day_name in ["Saturday", "Sunday"]

        response_html = f"""
        <div class="animate-fade-in space-y-3">
            <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full ty-bg-success"></div>
                <span class="font-medium">Date Selected: {formatted_date}</span>
            </div>
            <div class="ty-bg-{"warning" if is_weekend else "primary"}- rounded-lg p-3">
                <p class="text-sm">
                    {"🎉 Weekend day! Perfect for relaxation." if is_weekend else "💼 Weekday - great for productivity!"}
                </p>
                <p class="text-xs ty-text-neutral+ mt-1">
                    Server processed in {processing_time:.2f}s
                </p>
            </div>
        </div>
        """

        return response_html

    except Exception as e:
        return f"<p class='ty-text-danger'>❌ Error processing date: {str(e)}</p>"


@app.route("/api/calendar/select-date", methods=["POST"])
def calendar_select_date():
    """Handle event calendar date selection - returns events for selected date."""
    global event_counter
    
    # Debug logging
    print("=== EVENT CALENDAR DATE SELECT ===")
    print(f"Form data: {dict(request.form)}")
    print("==================================")
    
    # Parse the date from ty-calendar change event
    event_date = request.form.get("event_date")  # ISO date string from form
    year = request.form.get("year")
    month = request.form.get("month") 
    day = request.form.get("day")
    
    # Construct date string
    if year and month and day:
        # Convert to integers for proper formatting
        try:
            year_int = int(year)
            month_int = int(month)
            day_int = int(day)
            date_str = f"{year_int}-{month_int:02d}-{day_int:02d}"
        except ValueError:
            return render_template("partials/event_list.html", events=[], selected_date="Invalid date")
    elif event_date:
        date_str = event_date
    else:
        return render_template("partials/event_list.html", events=[], selected_date="Unknown")
    
    try:
        # Get events for this date
        events = user_events.get(date_str, [])
        
        # Format the date for display
        date_obj = datetime.fromisoformat(date_str)
        formatted_date = date_obj.strftime("%A, %B %d, %Y")
        
        print(f"📅 Date selected: {date_str} ({formatted_date})")
        print(f"📋 Found {len(events)} events")
        
        return render_template("partials/event_list.html", 
                             events=events, 
                             selected_date=formatted_date)
        
    except Exception as e:
        print(f"Error processing date selection: {e}")
        return render_template("partials/event_list.html", events=[], selected_date="Error")


@app.route("/api/calendar/create-event", methods=["POST"])
def create_event():
    """Create a new event for the selected date."""
    global event_counter
    
    print("=== CREATE EVENT ===")
    print(f"Form data: {dict(request.form)}")
    print("===================")
    
    # Get form data
    event_title = request.form.get("event_title", "").strip()
    event_type = request.form.get("event_type", "personal")
    event_date = request.form.get("event_date")  # From calendar
    
    # Validate input
    if not event_title:
        return "<p class='ty-text-danger'>❌ Event title is required</p>", 400
        
    if not event_date:
        return "<p class='ty-text-danger'>❌ Please select a date first</p>", 400
    
    try:
        # Get event type configuration
        type_config = EVENT_TYPES.get(event_type, EVENT_TYPES["personal"])
        
        # Parse date for validation
        date_obj = datetime.fromisoformat(event_date)
        formatted_date = date_obj.strftime("%A, %B %d, %Y")
        
        # Create new event
        new_event = {
            "id": event_counter,
            "title": event_title,
            "date": event_date,
            "formatted_date": formatted_date,
            "type": event_type,
            "icon": type_config["icon"],
            "color": type_config["color"],
            "name": type_config["name"],
            "time": None,  # Could be extended to include time
            "created_at": datetime.now().isoformat()
        }
        
        # Add to storage
        if event_date not in user_events:
            user_events[event_date] = []
        user_events[event_date].append(new_event)
        
        event_counter += 1
        
        print(f"✅ Created event: {event_title} on {formatted_date}")
        print(f"📊 Total events for {event_date}: {len(user_events[event_date])}")
        
        # Return updated event list
        return render_template("partials/event_list.html", 
                             events=user_events[event_date], 
                             selected_date=formatted_date)
        
    except Exception as e:
        print(f"Error creating event: {e}")
        return f"<p class='ty-text-danger'>❌ Error creating event: {str(e)}</p>", 500


@app.route("/api/calendar/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete an event by ID."""
    
    print(f"=== DELETE EVENT {event_id} ===")
    
    # Find and remove the event
    event_found = False
    target_date = None
    
    for date_str, events in user_events.items():
        for i, event in enumerate(events):
            if event["id"] == event_id:
                removed_event = events.pop(i)
                event_found = True
                target_date = date_str
                print(f"🗑️ Deleted event: {removed_event['title']} from {date_str}")
                break
        if event_found:
            break
    
    if not event_found:
        return "<p class='ty-text-danger'>❌ Event not found</p>", 404
    
    try:
        # Return updated event list for the date
        remaining_events = user_events.get(target_date, [])
        date_obj = datetime.fromisoformat(target_date)
        formatted_date = date_obj.strftime("%A, %B %d, %Y")
        
        print(f"📊 Remaining events for {target_date}: {len(remaining_events)}")
        
        return render_template("partials/event_list.html", 
                             events=remaining_events, 
                             selected_date=formatted_date)
                             
    except Exception as e:
        print(f"Error after deleting event: {e}")
        return f"<p class='ty-text-danger'>❌ Error: {str(e)}</p>", 500


@app.route("/api/month-events/<int:year>/<int:month>")
def month_events(year, month):
    """Get all events for a specific month - returns JSON with event counts per day."""
    try:
        # Use shared event generation function
        events_by_day = generate_month_events_data(year, month)
        
        # Convert to count format for calendar badges
        events_data = {}
        for date_str, day_events in events_by_day.items():
            events_data[date_str] = len(day_events)
        
        return events_data
        
    except Exception as e:
        print(f"Error generating month events for {year}-{month}: {e}")
        return {}


@app.route("/api/day-events/<int:year>-<int:month>-<int:day>")
def day_events(year, month, day):
    """Get events for a specific day - returns HTML badge for calendar day content."""
    try:
        # Create date string for consistent seeding
        date_str = f"{year}-{month:02d}-{day:02d}"
        
        # Simple mock data based on date for consistent results
        import hashlib
        # Use date as seed for consistent results across reloads
        seed = int(hashlib.md5(date_str.encode()).hexdigest()[:8], 16)
        random.seed(seed)
        
        event_count = random.randint(0, 3)
        
        if event_count == 0:
            return ""  # No badge for days with no events
        else:
            return f'<span class="event-badge">{event_count}</span>'
            
    except Exception as e:
        print(f"Error generating day events for {year}-{month}-{day}: {e}")
        return ""


@app.route("/api/modal/content/<content_type>")
def modal_content(content_type):
    """Dynamic modal content loading."""
    if content_type == "user-profile":
        user_id = request.args.get("user_id")
        if not user_id:
            return "User ID required", 400
        user = next((u for u in SAMPLE_USERS if u["id"] == int(user_id)), None)
        if not user:
            return "User not found", 404
        return render_template("partials/user_profile_modal.html", user=user)

    elif content_type == "task-details":
        task_id = request.args.get("task_id")
        if not task_id:
            return "Task ID required", 400
        task = next((t for t in SAMPLE_TASKS if t["id"] == int(task_id)), None)
        if not task:
            return "Task not found", 404
        return render_template("partials/task_details_modal.html", task=task)

    elif content_type == "weather-report":
        # Simulate weather data
        import time
        time.sleep(0.5)  # Simulate API delay
        weather_data = {
            "location": "Zagreb, Croatia",
            "temperature": random.randint(15, 25),
            "condition": random.choice(["Sunny", "Partly Cloudy", "Overcast", "Light Rain"]),
            "humidity": random.randint(40, 80),
            "wind": random.randint(5, 20)
        }
        return f"""
        <div class="p-8">
            <div class="text-center mb-6">
                <ty-icon name="cloud" class="w-16 h-16 mx-auto mb-4 ty-text-primary"></ty-icon>
                <h3 class="text-xl font-semibold ty-text-neutral++">Weather Report</h3>
                <p class="ty-text-neutral+">{weather_data['location']}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="text-center ty-bg-primary- rounded-lg p-4">
                    <div class="text-3xl font-bold ty-text-primary++">{weather_data['temperature']}°C</div>
                    <div class="text-sm ty-text-neutral+">Temperature</div>
                </div>
                <div class="text-center ty-bg-primary- rounded-lg p-4">
                    <div class="text-lg font-semibold ty-text-primary++">{weather_data['condition']}</div>
                    <div class="text-sm ty-text-neutral+">Conditions</div>
                </div>
                <div class="text-center ty-bg-success- rounded-lg p-4">
                    <div class="text-lg font-bold ty-text-success++">{weather_data['humidity']}%</div>
                    <div class="text-sm ty-text-neutral+">Humidity</div>
                </div>
                <div class="text-center ty-bg-warning- rounded-lg p-4">
                    <div class="text-lg font-bold ty-text-warning++">{weather_data['wind']} km/h</div>
                    <div class="text-sm ty-text-neutral+">Wind Speed</div>
                </div>
            </div>
            
            <div class="flex justify-end">
                <ty-button type="button" flavor="primary" onclick="this.closest('ty-modal').hide()">
                    <ty-icon slot="start" name="check"></ty-icon>
                    Close
                </ty-button>
            </div>
        </div>
        """

    elif content_type == "system-status":
        # Simulate system status data
        import time
        time.sleep(0.3)
        services = [
            {"name": "Web Server", "status": "online", "uptime": "99.9%"},
            {"name": "Database", "status": "online", "uptime": "99.7%"},
            {"name": "API Gateway", "status": "warning", "uptime": "98.5%"},
            {"name": "File Storage", "status": "online", "uptime": "99.8%"},
            {"name": "Email Service", "status": "offline", "uptime": "97.2%"}
        ]
        
        services_html = ""
        for service in services:
            status_color = "success" if service["status"] == "online" else ("warning" if service["status"] == "warning" else "danger")
            status_icon = "check-circle" if service["status"] == "online" else ("alert-triangle" if service["status"] == "warning" else "x-circle")
            
            services_html += f"""
            <div class="flex items-center justify-between py-3 border-b ty-border- last:border-b-0">
                <div class="flex items-center space-x-3">
                    <ty-icon name="{status_icon}" class="w-5 h-5 ty-text-{status_color}"></ty-icon>
                    <span class="font-medium">{service['name']}</span>
                </div>
                <div class="text-right">
                    <div class="text-sm font-semibold ty-text-{status_color}++ capitalize">{service['status']}</div>
                    <div class="text-xs ty-text-neutral+">{service['uptime']} uptime</div>
                </div>
            </div>
            """
        
        return f"""
        <div class="p-8">
            <div class="text-center mb-6">
                <ty-icon name="activity" class="w-16 h-16 mx-auto mb-4 ty-text-warning"></ty-icon>
                <h3 class="text-xl font-semibold ty-text-neutral++">System Status</h3>
                <p class="ty-text-neutral+">Real-time service monitoring</p>
            </div>
            
            <div class="mb-6">
                {services_html}
            </div>
            
            <div class="ty-bg-neutral- rounded-lg p-4 mb-6">
                <div class="flex items-center space-x-2 mb-2">
                    <ty-icon name="info" class="w-4 h-4 ty-text-primary"></ty-icon>
                    <span class="text-sm font-medium">Last Updated</span>
                </div>
                <p class="text-sm ty-text-neutral+">{datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
            </div>
            
            <div class="flex justify-end">
                <ty-button type="button" flavor="warning" onclick="this.closest('ty-modal').hide()">
                    <ty-icon slot="start" name="x"></ty-icon>
                    Close
                </ty-button>
            </div>
        </div>
        """

    elif content_type == "random-quote":
        # Random inspirational quotes
        quotes = [
            {"text": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
            {"text": "Innovation distinguishes between a leader and a follower.", "author": "Steve Jobs"},
            {"text": "Life is what happens to you while you're busy making other plans.", "author": "John Lennon"},
            {"text": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
            {"text": "It is during our darkest moments that we must focus to see the light.", "author": "Aristotle"},
            {"text": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"}
        ]
        
        quote = random.choice(quotes)
        return f"""
        <div class="p-8 text-center">
            <ty-icon name="message-circle" class="w-16 h-16 mx-auto mb-6 ty-text-neutral"></ty-icon>
            <blockquote class="text-xl ty-text-neutral++ font-medium mb-4 leading-relaxed">
                "{quote['text']}"
            </blockquote>
            <cite class="text-lg ty-text-neutral+ font-semibold">— {quote['author']}</cite>
            
            <div class="flex justify-center space-x-3 mt-8">
                <ty-button type="button" flavor="neutral" 
                           hx-get="/api/modal/content/random-quote"
                           hx-target="#dynamic-modal-content"
                           hx-swap="innerHTML">
                    <ty-icon slot="start" name="refresh-cw"></ty-icon>
                    Another Quote
                </ty-button>
                <ty-button type="button" flavor="primary" onclick="this.closest('ty-modal').hide()">
                    <ty-icon slot="start" name="heart"></ty-icon>
                    Love It!
                </ty-button>
            </div>
        </div>
        """

    elif content_type == "slow-loading":
        # Simulate slow loading
        import time
        time.sleep(2)
        return f"""
        <div class="p-8 text-center">
            <ty-icon name="check-circle" class="w-16 h-16 mx-auto mb-4 ty-text-success animate-bounce"></ty-icon>
            <h3 class="text-xl font-semibold ty-text-success++ mb-2">Content Loaded!</h3>
            <p class="ty-text-neutral+ mb-4">
                This content took 2 seconds to load, demonstrating loading states and indicators.
            </p>
            <div class="ty-bg-success- rounded-lg p-4 mb-6">
                <p class="text-sm ty-text-neutral+">
                    <strong>Pro tip:</strong> Use loading indicators to keep users informed during longer operations.
                </p>
            </div>
            <ty-button type="button" flavor="success" onclick="this.closest('ty-modal').hide()">
                <ty-icon slot="start" name="thumbs-up"></ty-icon>
                Got it!
            </ty-button>
        </div>
        """

    elif content_type == "error-demo":
        # Simulate different types of errors
        error_type = random.choice(["network", "server", "validation", "timeout"])
        
        if error_type == "network":
            return """
            <div class="p-8 text-center">
                <ty-icon name="wifi-off" class="w-16 h-16 mx-auto mb-4 ty-text-danger"></ty-icon>
                <h3 class="text-xl font-semibold ty-text-danger++ mb-2">Network Error</h3>
                <p class="ty-text-neutral+ mb-4">
                    Unable to connect to the server. Please check your internet connection.
                </p>
                <div class="ty-bg-danger- rounded-lg p-4 mb-6 text-left">
                    <div class="text-sm font-mono ty-text-danger++">Error Code: NET_001</div>
                    <div class="text-xs ty-text-neutral+ mt-1">Connection timeout after 30 seconds</div>
                </div>
                <div class="flex justify-center space-x-3">
                    <ty-button type="button" flavor="neutral" onclick="this.closest('ty-modal').hide()">
                        Cancel
                    </ty-button>
                    <ty-button type="button" flavor="danger">
                        <ty-icon slot="start" name="refresh-cw"></ty-icon>
                        Retry
                    </ty-button>
                </div>
            </div>
            """, 503
        
        return """
        <div class="p-8 text-center">
            <ty-icon name="alert-triangle" class="w-16 h-16 mx-auto mb-4 ty-text-danger"></ty-icon>
            <h3 class="text-xl font-semibold ty-text-danger++ mb-2">Something Went Wrong</h3>
            <p class="ty-text-neutral+ mb-4">
                An unexpected error occurred while processing your request.
            </p>
            <div class="ty-bg-danger- rounded-lg p-4 mb-6 text-left">
                <div class="text-sm font-mono ty-text-danger++">Error Code: SRV_500</div>
                <div class="text-xs ty-text-neutral+ mt-1">Internal server error - please try again later</div>
            </div>
            <ty-button type="button" flavor="danger" onclick="this.closest('ty-modal').hide()">
                <ty-icon slot="start" name="x"></ty-icon>
                Close
            </ty-button>
        </div>
        """, 500

    return "Content not found", 404


@app.route("/api/modal/contact/submit", methods=["POST"])
def submit_contact_form():
    """Handle contact form submission in modal."""
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip() 
    message = request.form.get("message", "").strip()
    
    errors = []
    
    # Validation
    if not name or len(name) < 2:
        errors.append("Name must be at least 2 characters")
    if not email or "@" not in email:
        errors.append("Please enter a valid email address")
    if not message or len(message) < 10:
        errors.append("Message must be at least 10 characters")
    
    if errors:
        error_html = "<br>".join([f"• {error}" for error in errors])
        return f"""
        <div class="ty-bg-danger- border ty-border-danger rounded-lg p-3 mb-4">
            <div class="flex items-start space-x-2">
                <ty-icon name="x-circle" class="w-5 h-5 ty-text-danger flex-shrink-0 mt-0.5"></ty-icon>
                <div>
                    <div class="font-medium ty-text-danger++ mb-1">Please fix the following errors:</div>
                    <div class="text-sm ty-text-danger+">{error_html}</div>
                </div>
            </div>
        </div>
        """
    
    # Success - simulate form submission
    import time
    time.sleep(0.5)  # Simulate processing
    
    return f"""
    <div class="ty-bg-success- border ty-border-success rounded-lg p-4 mb-4 text-center">
        <ty-icon name="check-circle" class="w-8 h-8 mx-auto mb-2 ty-text-success"></ty-icon>
        <div class="font-medium ty-text-success++ mb-1">Message Sent Successfully!</div>
        <div class="text-sm ty-text-success+">Thank you {escape(name)}, we'll get back to you soon.</div>
    </div>
    <script>
        setTimeout(function() {{
            document.getElementById('form-modal').hide();
        }}, 2000);
    </script>
    """


def render_wizard(step):
    return render_template("partials/wizard.html", step=step, v=request.form.to_dict())


@app.route("/api/modal/wizard/start")
def start_wizard():
    """Step 1 of the setup wizard (partials/wizard.html)."""
    return render_wizard(1)


@app.route("/api/modal/wizard/step1", methods=["POST"])
def wizard_step1():
    """Back to step 1, keeping what was entered."""
    return render_wizard(1)


@app.route("/api/modal/wizard/step2", methods=["POST"])
def wizard_step2():
    return render_wizard(2)


@app.route("/api/modal/wizard/step3", methods=["POST"])
def wizard_step3():
    return render_wizard(3)


@app.route("/api/modal/wizard/complete", methods=["POST"])
def wizard_complete():
    import time
    time.sleep(0.5)  # Simulate processing
    return render_wizard(4)


@app.route("/api/notifications/demo")
def demo_notification():
    """Generate a demo notification."""
    notifications = [
        {"type": "success", "message": "Task completed successfully!"},
        {"type": "warning", "message": "Server maintenance scheduled for tonight."},
        {"type": "info", "message": "New features available in the dashboard."},
        {"type": "error", "message": "Failed to save changes. Please try again."},
    ]

    notification = random.choice(notifications)
    return render_template("partials/notification.html", **notification)


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(error):
    return render_template("500.html"), 500


# Template filters
@app.template_filter("datetime_format")
def datetime_format(value, format_str="%B %d, %Y at %I:%M %p"):
    """Format datetime strings."""
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value)
            return dt.strftime(format_str)
        except ValueError:
            return value
    return value


@app.route("/api/compression-status")
def compression_status():
    """Debug endpoint to check if compression is working."""
    status_info = {
        "compression_enabled": compress is not None,
        "compress_mimetypes": app.config.get('COMPRESS_MIMETYPES', []),
        "compress_level": app.config.get('COMPRESS_LEVEL', 'default'),
        "compress_min_size": app.config.get('COMPRESS_MIN_SIZE', 'default'),
        "test_content": "This is a test response that should be compressed if gzip is working properly. " * 20
    }
    
    # Return a large JSON response to trigger compression
    return jsonify(status_info)


if __name__ == "__main__":
    print("🚀 Starting HTMX + Tyrell Demo")
    print("📝 Visit http://localhost:9000 to see the examples")
    print("🎨 Make sure Tyrell components are built and accessible")
    print("🗜️  Gzip compression enabled - responses will be compressed")
    print("🔍 Check compression status at: http://localhost:9000/api/compression-status")

    app.run(debug=True, host="0.0.0.0", port=9000)