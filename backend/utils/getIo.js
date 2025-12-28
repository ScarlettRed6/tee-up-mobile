export function getIO(req) {
    return req.app.get("io");
}

//Just renamed this file from gitIO to gitIo to  lessen required changes from
//multiple files