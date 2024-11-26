import Challenge from '../models/challenge_model.js';
import Subject from '../models/subject_model.js';

import mongoose from "mongoose";


export async function getChallenges(req, res) {
    try {
        const challenges = await Challenge.find();
        return res.status(200).json(challenges);
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

export async function getChallengeByName(req, res) {
    try {
        const challenge = await Challenge

            .findOne({ challenge_title: req.params.title });

        if (challenge !== null) {
            return res.status(200).json(challenge);
        }
        else return res.status(404);


    } catch (err) {
        console.error('Failed to fetch challenges:', err);
        return res.status(500);
    }
}

export async function createChallenge(req, res) {
    try {
        // Transform the incoming data to match schema structure
        const challengeData = {
            challenge_title: req.body.challenge_title,
            challenge_description: {
                description: req.body.challenge_description.description,
                input_format: req.body.challenge_description.input_format,
                output_format: req.body.challenge_description.output_format,
                constraints: req.body.challenge_description.constraints
            },
            challenge_difficulty: req.body.challenge_difficulty,
            languages_supported: req.body.language_supported, // Note the field name difference
            content_tags: req.body.content_tags,
            skeleton_code: {
                language: req.body.skeleton_code.language,
                code: req.body.skeleton_code.code
            },
            hints: req.body.hints,
            test_cases: req.body.test_cases.map(testCase => ({
                inputs: testCase.inputs,
                expected_output: JSON.stringify(testCase.expected_output) // Convert array to string
            }))
        };

        // Validate required fields
        const requiredFields = [
            'challenge_title',
            'challenge_description',
            'challenge_difficulty',
            'languages_supported',
            'skeleton_code',
            'test_cases'
        ];

        for (const field of requiredFields) {
            if (!challengeData[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Additional validation
        if (challengeData.challenge_difficulty < 1 || challengeData.challenge_difficulty > 10) {
            return res.status(400).json({ 
                error: 'Challenge difficulty must be between 1 and 10' 
            });
        }

        // Create the challenge
        const challenge = await mongoose.model('Challenge').create(challengeData);
        
        return res.status(201).json({
            message: 'Challenge created successfully',
            challenge: challenge
        });

    } catch (err) {
        console.error('Error creating challenge:', err);
        return res.status(500).json({ 
            error: 'Failed to create challenge',
            details: err.message 
        });
    }
}

// Route to get the first 20 challenges
export async function getSomeChallenges(req, res) {
    try {
        const challenges = await Challenge.find().limit(20);
        return res.status(200).json(challenges);
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}

// Route to get a specific challenge by its ID
export async function getChallengeById(req, res) {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        return res.status(200).json(challenge);
    } catch (err) {
        return res.status(500).json({ error: err });
    }
}
