# 🥷 YamiKura

<p align="center">
  <strong>Break things. Understand why. Learn how to secure them.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Cybersecurity-Security%20Challenges-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Environment-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Focus-Hands--On%20Learning-black?style=for-the-badge" />
</p>

---

## 🌑 About

**YamiKura** is a hands-on collection of cybersecurity challenges built for curious minds.

Inspired by real-world systems, vulnerabilities, and security problems, each challenge provides an opportunity to explore how things work, how they break, and how they can be secured.

Don't just solve the challenge. Understand the vulnerability, investigate its root cause, and learn something new along the way.

> ⚔️ Think like an attacker. Understand like a researcher. Defend like an engineer.

## 🎯 Features

- 🔍 **Real-World Scenarios** — Challenges inspired by real-world security vulnerabilities and attack techniques.
- 🧠 **Hands-On Learning** — Learn by experimenting, investigating, and solving problems.
- 🐳 **Dockerized Environments** — Isolated environments for running individual challenges.
- 🧩 **Independent Challenges** — Every challenge has its own application and configuration.
- 📚 **Learn by Breaking** — Understand vulnerabilities by exploring their behavior and root causes.

## 📂 Project Structure

Each challenge lives in its own directory under `challenges/`:

```text
YamiKura/
└── challenges/
    └── <challenge-name>/
        ├── app/                 # Challenge application and related files
        ├── Dockerfile           # Builds the challenge image
        └── docker-compose.yml   # Starts the challenge sandbox
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Run a Challenge

Clone the repository:

```bash
git clone https://github.com/<username>/YamiKura.git
cd YamiKura
```

Navigate to the challenge you want to run:

```bash
cd challenges/<challenge-name>
```

Build the challenge image:

```bash
docker build -t yamikura/<challenge-name> .
```

Start the sandbox:

```bash
docker compose up -d
```

### Stop a Challenge

When you're finished, stop and remove the challenge containers:

```bash
docker compose down
```

## 🛡️ Security & Responsible Use

YamiKura is designed for educational purposes and authorized security research.

- Run challenges only in their provided local environments.
- Never target systems you don't own or have explicit permission to test.
- Keep vulnerable applications isolated from public networks.
- Follow any challenge-specific instructions.

**Learn responsibly. Hack ethically.**

## 🧪 The Philosophy

> The best way to understand security is to understand how things fail.

Take your time with every challenge.

Explore the source code. Investigate unexpected behavior. Test your assumptions. Understand the vulnerability, then think about how to prevent it.

The goal isn't simply to find a way in.

**The goal is to understand why the door was open.**

---

<p align="center">
  <strong>🌑 YamiKura — Into the darkness, one vulnerability at a time.</strong>
</p>

<p align="center">
  <sub>Explore • Experiment • Exploit • Understand • Secure</sub>
</p>
