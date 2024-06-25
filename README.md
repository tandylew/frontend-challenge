# TGT Frontend Engineering Challenge

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)
- Backend for Engineering Challenge: [sf-eng-challenge-server](https://github.com/schmidtfutures/sf-eng-challenge-server)

## Steps to Deploy

### 1. Clone the Repository

Complete the following after the backend server is up and running as per the README for the respository listed in the prerequisites.

Clone the frontend challenge repository to your local machine and navigate to the frontend-challenge directory:

```bash
git clone https://github.com/tandylew/frontend-challenge.git
cd frontend-challenge
```

### 2. Build and Run the Docker Image

The following command will install the necessary packages and will run the application on port 3001 of the local machine:

```bash
docker-compose up --build
```

### 3. Navigate to the Application

The application should now be available through a web browser at http://localhost:3001/.

### 4. Features and Usage

The application supports sorting, filtering, pagination, and clickable fields. By default the page will have 10 entries showing users and their related fields, as well as aggregated fields related to their matches. 

First name, Last name, Matches Count, and Average Level Match can be sorted in either direction.

All fields can be filtered. Adding values to multiple filter fields will display the intersection of these filters.

A "Show All" button can be used to see all users. Click "Hide All" to navigate back to a paginated list. Previous and next buttons changes the current page, which is displayed at the bottom and whose value can be typed in (you may need to shift select of Ctrl+A to enter a new value here).

Clicking on any given row will take you to detailed information for that user including their name, email, picture, interests, and matches. Click "Go Back" if you wish to return to the previous page.

Feel free to reach out to me at tandylew@gmail.com if you have any questions.


