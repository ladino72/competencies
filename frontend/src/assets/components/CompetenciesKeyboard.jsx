import React from 'react'
import ComptencyOneRowKeyboard from '../components/ComptencyOneRowKeyboard';
function CompetenciesKeyboard() {

    // This part of the code destructure each of the rows of the keyboard
    const numCompetencies = 5; // Number of objects you want to create
    const keyboardRows = [];

    for (let i = 1; i <= numCompetencies; i++) {
        const { cpN1, cpN2, cpN3, render, setCPN1, setCPN2, setCPN3 } = ComptencyOneRowKeyboard();
        const newObj = {
            [`cp${i}1`]: cpN1,
            [`cp${i}2`]: cpN2,
            [`cp${i}3`]: cpN3,
            [`render${i}`]: render,
            [`setCPN${i}1`]: setCPN1,
            [`setCPN${i}2`]: setCPN2,
            [`setCPN${i}3`]: setCPN3,
        };
        keyboardRows.push(newObj);
    }

    const keyboard = {}
    for (const object of keyboardRows) {
        Object.assign(keyboard, object);    // Here we are merging the keyboardrows
    }

    return keyboard

}


export default CompetenciesKeyboard