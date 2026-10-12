const answerKey = {
	q1: "frog",
	q2: "sucks",
	q3: "zebra",
	q4: "dog",
	q5: "leech",
	q6: "false",
	q7: "false",
	q8: "false",
	q9: "true",
	q10: "true"
};

const quizForm = document.querySelector("#quiz-form");
const results = document.querySelector("#results");
const answerInputs = [...quizForm.querySelectorAll('input[type="radio"], input[type="text"]')];
const totalAnswers = new Set(answerInputs.filter((input) => input.type === "radio").map((input) => input.name)).size
	+ answerInputs.filter((input) => input.type === "text").length;
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const progressText = document.querySelector("#progress-text");

function normalizeAnswer(value) {
	return value.trim().toLocaleLowerCase().replace(/[.!?,]/g, "").replace(/\s+/g, " ");
}

function updateProgress() {
	const answered = new Set(answerInputs.filter((input) => input.checked || input.value.trim()).map((input) => input.name.replace(/[ab]$/, ""))).size;
	const answerCount = answerInputs.some((input) => input.type === "text")
		? answerInputs.filter((input) => input.checked || input.value.trim()).length
		: answered;
	const percentage = (answerCount / totalAnswers) * 100;
	progressFill.style.width = `${percentage}%`;
	progressTrack.setAttribute("aria-valuenow", String(answerCount));
	progressText.textContent = `${answerCount} of ${totalAnswers} answered`;
}

function checkChoiceQuestions() {
	let score = 0;

	for (const [name, correctAnswer] of Object.entries(answerKey)) {
		const question = quizForm.querySelector(`[data-question="${name}"]`);
		const selected = quizForm.querySelector(`input[name="${name}"]:checked`);
		const feedback = question.querySelector(".question-feedback");
		const correctLabel = [...question.querySelectorAll(".option")].find((label) => label.querySelector("input").value === correctAnswer);

		correctLabel.classList.add("is-correct");
		if (selected?.value === correctAnswer) {
			score += 1;
			feedback.textContent = "That’s right!";
			feedback.className = "question-feedback correct";
		} else {
			if (selected) selected.closest(".option").classList.add("is-incorrect");
			feedback.textContent = selected ? "Not quite. The highlighted answer is correct." : "Not answered. The highlighted answer is correct.";
			feedback.className = "question-feedback incorrect";
		}
	}

	return score;
}

function checkWrittenQuestions() {
	let score = 0;

	for (const question of quizForm.querySelectorAll(".written-question")) {
		const fields = [...question.querySelectorAll('input[type="text"]')];
		const feedback = question.querySelector(".written-feedback");
		const accepted = fields.map((field) => new Set(field.dataset.accepted.split("|").map(normalizeAnswer)));
		const seenCorrectAnswers = new Set();
		let questionScore = 0;

		fields.forEach((field, index) => {
			const answer = normalizeAnswer(field.value);
			const isCorrect = answer && accepted[index].has(answer) && !seenCorrectAnswers.has(answer);

			field.classList.add(isCorrect ? "is-correct" : "is-incorrect");
			if (isCorrect) {
				seenCorrectAnswers.add(answer);
				questionScore += 1;
			}
		});

		score += questionScore;
		feedback.textContent = questionScore === 2
			? "Great examples!"
			: "One point for each different animal that fits the group.";
		feedback.className = `written-feedback ${questionScore === 2 ? "correct" : "incorrect"}`;
	}

	return score;
}

function showResults(score) {
	const title = document.querySelector("#results-title");
	const message = document.querySelector("#results-message");
	const kicker = document.querySelector("#results-kicker");

	document.querySelector("#score-value").textContent = String(score);
	if (score === 20) {
		title.textContent = "Amazing explorer!";
		message.textContent = "A perfect score. You know your animal eaters!";
		kicker.textContent = "PERFECT SCORE";
	} else if (score >= 14) {
		title.textContent = "Wonderful work!";
		message.textContent = "You’re learning lots about the animal kingdom.";
		kicker.textContent = "TEST COMPLETE";
	} else if (score >= 7) {
		title.textContent = "Good exploring!";
		message.textContent = "Check the green answers, then give it another go.";
		kicker.textContent = "TEST COMPLETE";
	} else {
		title.textContent = "Keep discovering!";
		message.textContent = "Every explorer learns one answer at a time. Try again!";
		kicker.textContent = "TEST COMPLETE";
	}

	results.hidden = false;
	results.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

answerInputs.forEach((input) => input.addEventListener("input", updateProgress));
answerInputs.filter((input) => input.type === "radio").forEach((input) => input.addEventListener("change", updateProgress));

quizForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const score = checkChoiceQuestions() + checkWrittenQuestions();
	showResults(score);
});

quizForm.addEventListener("reset", () => {
	requestAnimationFrame(() => {
		quizForm.querySelectorAll(".is-correct, .is-incorrect").forEach((element) => element.classList.remove("is-correct", "is-incorrect"));
		quizForm.querySelectorAll(".question-feedback, .written-feedback").forEach((feedback) => {
			feedback.textContent = "";
			feedback.className = feedback.classList.contains("question-feedback") ? "question-feedback" : "written-feedback";
		});
		results.hidden = true;
		updateProgress();
	});
});

updateProgress();
