exports.getDate = () => {
    const date = new Date ();
    let options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }
    return date.toLocaleDateString ('en-US', options);
}

exports.getDay = () => {
    let date = new Date ();
    let options = {
        weekday: 'long'
    }
    return date.toLocaleDateString ('en-US', options);
}

console.log (module);