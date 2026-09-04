(function () {
  "use strict";

  var PI = Math.PI;
  var TWO_PI = 2 * PI;
  var MODE_ORDER = ["points", "formula", "combine"];
  var SERIES_COLORS = ["#8B6FEA", "#22B8CF", "#F59E0B"];
  var SERIES_GLOWS = ["rgba(139, 111, 234, 0.24)", "rgba(34, 184, 207, 0.24)", "rgba(245, 158, 11, 0.24)"];

  function f(n, d) {
    return n / (d || 1);
  }

  function grid(count, offset) {
    var result = [];
    var start = offset || 0;
    for (var i = 0; i < count; i += 1) {
      result.push(normalizeFactor(start + (2 * i) / count));
    }
    return result;
  }

  var STANDARD_POINTS = [
    0,
    f(1, 6), f(1, 4), f(1, 3),
    f(1, 2),
    f(2, 3), f(3, 4), f(5, 6),
    1,
    f(7, 6), f(5, 4), f(4, 3),
    f(3, 2),
    f(5, 3), f(7, 4), f(11, 6)
  ];

  var tasks = {
    points: [
      { id: "1.1", formula: "2πk", target: [0], candidates: STANDARD_POINTS, explanation: "При любом целом k получается начало отсчёта: t ≡ 0 (mod 2π)." },
      { id: "1.2", formula: "π/2+πk", target: [f(1, 2), f(3, 2)], candidates: STANDARD_POINTS, explanation: "Шаг π переводит точку в диаметрально противоположную." },
      { id: "1.3", formula: "πk", target: [0, 1], candidates: STANDARD_POINTS, explanation: "Чётные k дают 0, нечётные — π." },
      { id: "1.4", formula: "±π/2+2πk", target: [f(1, 2), f(3, 2)], candidates: STANDARD_POINTS, explanation: "Знак ± задаёт две точки: π/2 и −π/2." },
      { id: "1.5", formula: "±π/6+2πk", target: [f(1, 6), f(11, 6)], candidates: STANDARD_POINTS, explanation: "На одном обороте это точки π/6 и 11π/6." },
      { id: "1.6", formula: "±π/3+πk", target: [f(1, 3), f(2, 3), f(4, 3), f(5, 3)], candidates: STANDARD_POINTS, explanation: "Каждый из двух начальных углов повторяется с шагом π." },
      { id: "1.7", formula: "2πk/3", target: [0, f(2, 3), f(4, 3)], candidates: STANDARD_POINTS, explanation: "Шаг равен 2π/3, поэтому за оборот получаются три точки." },
      { id: "1.8", formula: "πk/3", target: [0, f(1, 3), f(2, 3), 1, f(4, 3), f(5, 3)], candidates: STANDARD_POINTS, explanation: "Шаг π/3 делит окружность на шесть равных частей." },
      { id: "1.9", formula: "(-1)^kπ/6+πk", target: [f(1, 6), f(5, 6)], candidates: STANDARD_POINTS, explanation: "Чётные и нечётные k дают соответственно π/6 и 5π/6." },
      { id: "1.10", formula: "π/4+πk/2", target: [f(1, 4), f(3, 4), f(5, 4), f(7, 4)], candidates: STANDARD_POINTS, explanation: "Начальная точка π/4 повторяется с шагом π/2." },
      { id: "1.11", formula: "(-1)^(k+1)π/3+πk", target: [f(4, 3), f(5, 3)], candidates: STANDARD_POINTS, explanation: "После учёта чётности k остаются точки 4π/3 и 5π/3." },
      { id: "1.12", formula: "-π/6+2πk/3", target: [f(11, 6), f(1, 2), f(7, 6)], candidates: STANDARD_POINTS, explanation: "Шаг 2π/3 даёт три точки на одном полном обороте." }
    ],
    formula: [
      { id: "1.13а", names: "M, N, P, Q", target: [f(1, 4), f(3, 4), f(5, 4), f(7, 4)], candidates: STANDARD_POINTS, expected: "π/4+πk/2" },
      { id: "1.13б", names: "A, B, C, D", target: [0, f(1, 2), 1, f(3, 2)], candidates: STANDARD_POINTS, expected: "πk/2" },
      { id: "1.13в", names: "N, Q", target: [f(3, 4), f(7, 4)], candidates: STANDARD_POINTS, expected: "3π/4+πk" },
      { id: "1.13г", names: "M, P", target: [f(1, 4), f(5, 4)], candidates: STANDARD_POINTS, expected: "π/4+πk" },
      { id: "1.13д", names: "B, D", target: [f(1, 2), f(3, 2)], candidates: STANDARD_POINTS, expected: "π/2+πk" },
      { id: "1.13е", names: "A, M, B, N, C, P, D, Q", target: grid(8), candidates: STANDARD_POINTS, expected: "πk/4" },
      { id: "1.14а", names: "M, K", target: [f(1, 6), f(7, 6)], candidates: STANDARD_POINTS, expected: "π/6+πk" },
      { id: "1.14б", names: "P, E", target: [f(2, 3), f(5, 3)], candidates: STANDARD_POINTS, expected: "2π/3+πk" },
      { id: "1.14в", names: "P, L", target: [f(2, 3), f(4, 3)], candidates: STANDARD_POINTS, expected: "±2π/3+2πk" },
      { id: "1.14г", names: "M, F", target: [f(1, 6), f(11, 6)], candidates: STANDARD_POINTS, expected: "±π/6+2πk" },
      { id: "1.15а", names: "A, P, L", target: [0, f(2, 3), f(4, 3)], candidates: STANDARD_POINTS, expected: "2πk/3" },
      { id: "1.15б", names: "B, F, K", target: [f(1, 2), f(11, 6), f(7, 6)], candidates: STANDARD_POINTS, expected: "π/2+2πk/3" },
      { id: "1.15в", names: "F, M, Q, K", target: [f(11, 6), f(1, 6), f(5, 6), f(7, 6)], candidates: STANDARD_POINTS, expected: "±π/6+πk" },
      { id: "1.15г", names: "A, N, P, C, L, E", target: [0, f(1, 3), f(2, 3), 1, f(4, 3), f(5, 3)], candidates: STANDARD_POINTS, expected: "πk/3" }
    ],
    combine: [
      { id: "1.16", formulas: ["2πk", "π+2πk"], target: [0, 1], candidates: STANDARD_POINTS, expected: "πk" },
      { id: "1.17", formulas: ["πk", "π/2+πk"], target: [0, f(1, 2), 1, f(3, 2)], candidates: STANDARD_POINTS, expected: "πk/2" },
      { id: "1.18", formulas: ["π/2+2πk", "3π/2+2πk"], target: [f(1, 2), f(3, 2)], candidates: STANDARD_POINTS, expected: "π/2+πk" },
      { id: "1.19", formulas: ["πk", "πk/2"], target: [0, f(1, 2), 1, f(3, 2)], candidates: STANDARD_POINTS, expected: "πk/2" },
      { id: "1.20", formulas: ["±π/3+πk", "πk/3"], target: [0, f(1, 3), f(2, 3), 1, f(4, 3), f(5, 3)], candidates: STANDARD_POINTS, expected: "πk/3" },
      { id: "1.21", formulas: ["(-1)^kπ/4+πk", "(-1)^(k+1)π/4+πk"], target: [f(1, 4), f(3, 4), f(5, 4), f(7, 4)], candidates: STANDARD_POINTS, expected: "π/4+πk/2" },
      { id: "1.22", formulas: ["±2π/3+2πk", "2πk"], target: [0, f(2, 3), f(4, 3)], candidates: STANDARD_POINTS, expected: "2πk/3" },
      { id: "1.23", formulas: ["(-1)^kπ/6+πk", "(-1)^(k+1)π/6+πk"], target: [f(1, 6), f(5, 6), f(7, 6), f(11, 6)], candidates: STANDARD_POINTS, expected: "±π/6+πk" },
      { id: "1.24", formulas: ["-π/6+π(2n+1)", "π/30+2πk/5"], target: [f(1, 30), f(13, 30), f(5, 6), f(37, 30), f(49, 30)], candidates: grid(10, f(1, 30)), expected: "π/30+2πk/5" },
      { id: "1.25", formulas: ["(-1)^kπ/3+πk", "(-1)^(k+1)π/3+πk", "πk"], target: [0, f(1, 3), f(2, 3), 1, f(4, 3), f(5, 3)], candidates: STANDARD_POINTS, expected: "πk/3" },
      { id: "1.26", formulas: ["±π/4+πk", "π/2+πk", "πk"], target: grid(8), candidates: STANDARD_POINTS, expected: "πk/4" },
      { id: "1.27", formulas: ["-π/4+πk", "π/4±π/6+πk"], target: [f(1, 12), f(5, 12), f(3, 4), f(13, 12), f(17, 12), f(7, 4)], candidates: grid(12, f(1, 12)), expected: "π/12+πk/3" },
      { id: "1.28", formulas: ["π/2+πk", "±π/6+πk"], target: [f(1, 6), f(1, 2), f(5, 6), f(7, 6), f(3, 2), f(11, 6)], candidates: STANDARD_POINTS, expected: "π/6+πk/3" }
    ]
  };

  var modeConfig = {
    points: {
      label: "По формуле",
      type: "ФОРМУЛА → ТОЧКИ",
      title: "Отметьте все точки, заданные формулой",
      circleTitle: "Отметьте все точки"
    },
    formula: {
      label: "По точкам",
      type: "ТОЧКИ → ФОРМУЛА",
      title: "Составьте формулу для указанных точек",
      circleTitle: "Определите положение точек"
    },
    combine: {
      label: "Объединение",
      type: "ФОРМУЛЫ → ОБЩАЯ ФОРМУЛА",
      title: "Объедините наборы точек",
      circleTitle: "Сначала отметьте объединение"
    }
  };

  var state = {
    mode: "points",
    index: 0,
    selected: new Set(),
    phase: "points",
    seriesIndex: 0,
    confirmedSeries: [],
    seriesStatus: [],
    solved: false,
    wrongAttempts: { points: 0, formula: 0, combine: 0 },
    taskStatus: {
      points: tasks.points.map(function () { return "idle"; }),
      formula: tasks.formula.map(function () { return "idle"; }),
      combine: tasks.combine.map(function () { return "idle"; })
    },
    drafts: {
      points: tasks.points.map(function () { return null; }),
      formula: tasks.formula.map(function () { return null; }),
      combine: tasks.combine.map(function () { return null; })
    },
    lastFocus: null
  };

  if (typeof document === "undefined") {
    globalThis.__trigTrainerTest = {
      tasks: tasks,
      setFromFormula: setFromFormula,
      targetSet: targetSet,
      seriesTargetSet: seriesTargetSet,
      setsEqual: setsEqual,
      nextOpenIndex: nextOpenIndex
    };
    return;
  }

  var elements = {
    modeTabs: Array.prototype.slice.call(document.querySelectorAll(".mode-tab")),
    modeLabel: document.getElementById("modeLabel"),
    progressText: document.getElementById("progressText"),
    correctCount: document.getElementById("correctCount"),
    incorrectCount: document.getElementById("incorrectCount"),
    activeCount: document.getElementById("activeCount"),
    idleCount: document.getElementById("idleCount"),
    taskStatusList: document.getElementById("taskStatusList"),
    circleTitle: document.getElementById("circleTitle"),
    selectionCount: document.getElementById("selectionCount"),
    pointLayer: document.getElementById("pointLayer"),
    circleLegend: document.getElementById("circleLegend"),
    taskType: document.getElementById("taskType"),
    taskId: document.getElementById("taskId"),
    taskTitle: document.getElementById("taskTitle"),
    taskPrompt: document.getElementById("taskPrompt"),
    taskInstruction: document.getElementById("taskInstruction"),
    formulaEditor: document.getElementById("formulaEditor"),
    formulaInput: document.getElementById("formulaInput"),
    formulaPreview: document.getElementById("formulaPreview"),
    feedback: document.getElementById("feedback"),
    hintButton: document.getElementById("hintButton"),
    clearButton: document.getElementById("clearButton"),
    checkButton: document.getElementById("checkButton"),
    keyboard: document.querySelector(".keyboard"),
    completionDialog: document.getElementById("completionDialog"),
    completionText: document.getElementById("completionText"),
    repeatButton: document.getElementById("repeatButton"),
    nextModeButton: document.getElementById("nextModeButton")
  };

  function normalizeFactor(value) {
    var result = value % 2;
    if (result < 0) {
      result += 2;
    }
    if (Math.abs(result - 2) < 1e-9 || Math.abs(result) < 1e-9) {
      return 0;
    }
    return result;
  }

  function factorKey(value) {
    return String(Math.round(normalizeFactor(value) * 1000000));
  }

  function currentTask() {
    return tasks[state.mode][state.index];
  }

  function gcd(a, b) {
    var x = Math.abs(a);
    var y = Math.abs(b);
    while (y) {
      var next = x % y;
      x = y;
      y = next;
    }
    return x || 1;
  }

  function rationalApprox(value) {
    var normalized = normalizeFactor(value);
    if (normalized === 0) {
      return { n: 0, d: 1 };
    }
    var best = { n: Math.round(normalized), d: 1, error: Infinity };
    for (var d = 1; d <= 60; d += 1) {
      var n = Math.round(normalized * d);
      var error = Math.abs(normalized - n / d);
      if (error < best.error) {
        best = { n: n, d: d, error: error };
      }
    }
    var divisor = gcd(best.n, best.d);
    return { n: best.n / divisor, d: best.d / divisor };
  }

  function factorMathML(value, includeMathTag) {
    var fraction = rationalApprox(value);
    var body;
    if (fraction.n === 0) {
      body = "<mn>0</mn>";
    } else {
      var numerator = fraction.n === 1 ? "<mi>π</mi>" : "<mrow><mn>" + fraction.n + "</mn><mi>π</mi></mrow>";
      body = fraction.d === 1 ? numerator : "<mfrac>" + numerator + "<mn>" + fraction.d + "</mn></mfrac>";
    }
    if (includeMathTag === false) {
      return body;
    }
    return "<math xmlns=\"http://www.w3.org/1998/Math/MathML\">" + body + "</math>";
  }

  function angleText(value) {
    var fraction = rationalApprox(value);
    if (fraction.n === 0) {
      return "0";
    }
    var numerator = fraction.n === 1 ? "π" : String(fraction.n) + "π";
    return fraction.d === 1 ? numerator : numerator + "/" + fraction.d;
  }

  function normalizeFormulaSource(source) {
    return String(source || "")
      .trim()
      .replace(/^[tт]\s*=/i, "")
      .replace(/[\u2212\u2013\u2014]/g, "-")
      .replace(/[×·]/g, "*")
      .replace(/pi/gi, "π")
      .replace(/(\d),(\d)/g, "$1.$2")
      .replace(/[{}\[\]]/g, function (symbol) {
        return symbol === "{" || symbol === "[" ? "(" : ")";
      })
      .replace(/\s+/g, "");
  }

  function tokenize(source) {
    var input = normalizeFormulaSource(source);
    if (!input) {
      throw new Error("empty");
    }
    var raw = [];
    var i = 0;
    while (i < input.length) {
      var char = input[i];
      if ((char >= "0" && char <= "9") || char === ".") {
        var start = i;
        i += 1;
        while (i < input.length && /[0-9.]/.test(input[i])) {
          i += 1;
        }
        var number = Number(input.slice(start, i));
        if (!Number.isFinite(number)) {
          throw new Error("number");
        }
        raw.push({ type: "number", value: number });
        continue;
      }
      if (char === "π") {
        raw.push({ type: "pi" });
        i += 1;
        continue;
      }
      if (char === "k" || char === "n") {
        raw.push({ type: "variable", value: char });
        i += 1;
        continue;
      }
      if (char === "+") {
        raw.push({ type: "plus" });
        i += 1;
        continue;
      }
      if (char === "-") {
        raw.push({ type: "minus" });
        i += 1;
        continue;
      }
      if (char === "±") {
        raw.push({ type: "pm" });
        i += 1;
        continue;
      }
      if (char === "*") {
        raw.push({ type: "multiply" });
        i += 1;
        continue;
      }
      if (char === "/") {
        raw.push({ type: "divide" });
        i += 1;
        continue;
      }
      if (char === "^") {
        raw.push({ type: "power" });
        i += 1;
        continue;
      }
      if (char === "(") {
        raw.push({ type: "lparen" });
        i += 1;
        continue;
      }
      if (char === ")") {
        raw.push({ type: "rparen" });
        i += 1;
        continue;
      }
      throw new Error("character");
    }

    var tokens = [];
    function canEnd(token) {
      return token && ["number", "pi", "variable", "rparen"].indexOf(token.type) !== -1;
    }
    function canStart(token) {
      return token && ["number", "pi", "variable", "lparen"].indexOf(token.type) !== -1;
    }
    for (var j = 0; j < raw.length; j += 1) {
      var previous = tokens[tokens.length - 1];
      var current = raw[j];
      if (canEnd(previous) && canStart(current)) {
        tokens.push({ type: "multiply", implicit: true });
      }
      tokens.push(current);
    }
    return tokens;
  }

  function parseFormula(source) {
    var tokens = tokenize(source);
    var position = 0;

    function peek(type) {
      return tokens[position] && tokens[position].type === type;
    }

    function take(type) {
      if (!peek(type)) {
        throw new Error("syntax");
      }
      return tokens[position++];
    }

    function parseExpression() {
      var node = parseTerm();
      while (peek("plus") || peek("minus") || peek("pm")) {
        var operatorToken = tokens[position++].type;
        var operator = operatorToken === "plus" ? "+" : operatorToken === "minus" ? "-" : "±";
        node = { type: "binary", operator: operator, left: node, right: parseTerm() };
      }
      return node;
    }

    function parseTerm() {
      var node = parsePower();
      while (peek("multiply") || peek("divide")) {
        var token = tokens[position++];
        node = {
          type: "binary",
          operator: token.type === "multiply" ? "*" : "/",
          implicit: Boolean(token.implicit),
          left: node,
          right: parsePower()
        };
      }
      return node;
    }

    function parsePower() {
      var node = parseUnary();
      if (peek("power")) {
        position += 1;
        node = { type: "binary", operator: "^", left: node, right: parsePower() };
      }
      return node;
    }

    function parseUnary() {
      if (peek("plus")) {
        position += 1;
        return parseUnary();
      }
      if (peek("minus")) {
        position += 1;
        return { type: "unary", operator: "-", child: parseUnary() };
      }
      if (peek("pm")) {
        position += 1;
        return { type: "unary", operator: "±", child: parseUnary() };
      }
      return parsePrimary();
    }

    function parsePrimary() {
      if (peek("number")) {
        return { type: "number", value: take("number").value };
      }
      if (peek("pi")) {
        take("pi");
        return { type: "pi" };
      }
      if (peek("variable")) {
        return { type: "variable", value: take("variable").value };
      }
      if (peek("lparen")) {
        take("lparen");
        var expression = parseExpression();
        take("rparen");
        return { type: "group", child: expression };
      }
      throw new Error("primary");
    }

    var ast = parseExpression();
    if (position !== tokens.length) {
      throw new Error("trailing");
    }
    return ast;
  }

  function evaluateAst(node, variable, pmSign) {
    if (node.type === "number") {
      return node.value;
    }
    if (node.type === "pi") {
      return PI;
    }
    if (node.type === "variable") {
      return variable;
    }
    if (node.type === "group") {
      return evaluateAst(node.child, variable, pmSign);
    }
    if (node.type === "unary") {
      var unaryValue = evaluateAst(node.child, variable, pmSign);
      return node.operator === "±" ? pmSign * unaryValue : -unaryValue;
    }
    var left = evaluateAst(node.left, variable, pmSign);
    var right = evaluateAst(node.right, variable, pmSign);
    if (node.operator === "+") {
      return left + right;
    }
    if (node.operator === "-") {
      return left - right;
    }
    if (node.operator === "±") {
      return left + pmSign * right;
    }
    if (node.operator === "*") {
      return left * right;
    }
    if (node.operator === "/") {
      return left / right;
    }
    if (node.operator === "^") {
      return Math.pow(left, right);
    }
    throw new Error("operator");
  }

  function astContainsPlusMinus(node) {
    if (!node) {
      return false;
    }
    if ((node.type === "unary" || node.type === "binary") && node.operator === "±") {
      return true;
    }
    return astContainsPlusMinus(node.left) || astContainsPlusMinus(node.right) || astContainsPlusMinus(node.child);
  }

  function nodePrecedence(node) {
    if (!node || node.type !== "binary") {
      return 10;
    }
    if (node.operator === "+" || node.operator === "-") {
      return 1;
    }
    if (node.operator === "*" || node.operator === "/") {
      return 2;
    }
    if (node.operator === "^") {
      return 3;
    }
    return 0;
  }

  function astToMathML(node, parentPrecedence) {
    var currentPrecedence = nodePrecedence(node);
    var body = "";
    if (node.type === "number") {
      body = "<mn>" + String(node.value) + "</mn>";
    } else if (node.type === "pi") {
      body = "<mi>π</mi>";
    } else if (node.type === "variable") {
      body = "<mi>" + node.value + "</mi>";
    } else if (node.type === "group") {
      body = "<mrow><mo>(</mo>" + astToMathML(node.child, 0) + "<mo>)</mo></mrow>";
    } else if (node.type === "unary") {
      body = "<mrow><mo>" + (node.operator === "±" ? "±" : "−") + "</mo>" + astToMathML(node.child, 4) + "</mrow>";
    } else if (node.type === "binary" && node.operator === "/") {
      body = "<mfrac><mrow>" + astToMathML(node.left, 0) + "</mrow><mrow>" + astToMathML(node.right, 0) + "</mrow></mfrac>";
    } else if (node.type === "binary" && node.operator === "^") {
      body = "<msup><mrow>" + astToMathML(node.left, 3) + "</mrow><mrow>" + astToMathML(node.right, 0) + "</mrow></msup>";
    } else if (node.type === "binary") {
      var symbol = node.operator === "*" ? (node.implicit ? "⁢" : "·") : node.operator === "-" ? "−" : node.operator;
      body = "<mrow>" + astToMathML(node.left, currentPrecedence) + "<mo>" + symbol + "</mo>" + astToMathML(node.right, currentPrecedence + 0.1) + "</mrow>";
    }
    if (currentPrecedence < (parentPrecedence || 0) && node.type === "binary") {
      return "<mrow><mo>(</mo>" + body + "<mo>)</mo></mrow>";
    }
    return body;
  }

  function formulaMathML(source, withPrefix) {
    var ast = parseFormula(source);
    var prefix = withPrefix ? "<mi>t</mi><mo>=</mo>" : "";
    return "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow>" + prefix + astToMathML(ast, 0) + "</mrow></math>";
  }

  function setFromFormula(source) {
    var ast = parseFormula(source);
    var signs = astContainsPlusMinus(ast) ? [-1, 1] : [1];
    var result = new Set();
    for (var k = -180; k <= 180; k += 1) {
      for (var s = 0; s < signs.length; s += 1) {
        var value = evaluateAst(ast, k, signs[s]);
        if (!Number.isFinite(value)) {
          throw new Error("finite");
        }
        var factor = normalizeFactor(value / PI);
        result.add(factorKey(factor));
        if (result.size > 120) {
          return result;
        }
      }
    }
    return result;
  }

  function targetSet(task) {
    return new Set(task.target.map(factorKey));
  }

  function seriesTargetSet(task, seriesIndex) {
    var generated = setFromFormula(task.formulas[seriesIndex]);
    var result = new Set();
    task.candidates.forEach(function (factor) {
      var key = factorKey(factor);
      if (generated.has(key)) {
        result.add(key);
      }
    });
    return result;
  }

  function setsEqual(first, second) {
    if (first.size !== second.size) {
      return false;
    }
    var equal = true;
    first.forEach(function (key) {
      if (!second.has(key)) {
        equal = false;
      }
    });
    return equal;
  }

  function renderPrompt(task) {
    elements.taskPrompt.innerHTML = "";
    elements.taskPrompt.classList.remove("is-list");
    if (state.mode === "formula") {
      var pointSet = document.createElement("span");
      pointSet.className = "named-point-set";
      pointSet.textContent = task.names;
      elements.taskPrompt.appendChild(pointSet);
      elements.taskPrompt.setAttribute("aria-label", "Точки " + task.names);
      return;
    }

    var formulas = state.mode === "combine" ? task.formulas : [task.formula];
    if (formulas.length > 1) {
      elements.taskPrompt.classList.add("is-list");
    }
    formulas.forEach(function (formula, index) {
      var line = document.createElement("div");
      line.className = "formula-line";
      if (state.mode === "combine") {
        var currentSeriesStatus = state.seriesStatus[index] || "idle";
        line.classList.add("is-series-line");
        line.style.setProperty("--series-color", SERIES_COLORS[index]);
        if (currentSeriesStatus === "correct") {
          line.classList.add("is-complete");
        } else if (currentSeriesStatus === "incorrect") {
          line.classList.add("is-incorrect");
        } else if (state.phase === "series" && index === state.seriesIndex) {
          line.classList.add("is-active");
        } else {
          line.classList.add("is-pending");
        }

        var swatch = document.createElement("span");
        swatch.className = "series-swatch";
        swatch.setAttribute("aria-hidden", "true");
        line.appendChild(swatch);
      }

      var formulaBody = document.createElement("span");
      formulaBody.className = "formula-body";
      try {
        formulaBody.innerHTML = formulaMathML(formula, true);
      } catch (error) {
        formulaBody.textContent = "t = " + formula;
      }
      line.appendChild(formulaBody);

      if (state.mode === "combine") {
        var seriesState = document.createElement("span");
        seriesState.className = "series-state";
        if (state.seriesStatus[index] === "correct") {
          seriesState.textContent = "верно";
        } else if (state.seriesStatus[index] === "incorrect") {
          seriesState.textContent = "ошибка";
        } else if (state.phase === "series" && index === state.seriesIndex) {
          seriesState.textContent = "сейчас";
        } else {
          seriesState.textContent = "далее";
        }
        line.appendChild(seriesState);
      }
      elements.taskPrompt.appendChild(line);
    });
    elements.taskPrompt.setAttribute("aria-label", formulas.map(function (formula) {
      return "t равно " + formula;
    }).join("; "));
  }

  function seriesFill(indices) {
    if (indices.length === 1) {
      return SERIES_COLORS[indices[0]];
    }
    var step = 100 / indices.length;
    var stops = [];
    indices.forEach(function (index, position) {
      stops.push(SERIES_COLORS[index] + " " + (position * step) + "% " + ((position + 1) * step) + "%");
    });
    return "conic-gradient(" + stops.join(", ") + ")";
  }

  function pointSeriesMemberships(key) {
    var memberships = [];
    state.confirmedSeries.forEach(function (series, index) {
      if (series.has(key)) {
        memberships.push(index);
      }
    });
    if (state.phase === "series" && state.selected.has(key) && memberships.indexOf(state.seriesIndex) === -1) {
      memberships.push(state.seriesIndex);
    }
    return memberships;
  }

  function renderCircle(task) {
    elements.pointLayer.innerHTML = "";
    var interactive = !state.solved && (state.mode === "points" || (state.mode === "combine" && state.phase === "series"));
    var target = targetSet(task);

    task.candidates.forEach(function (factor) {
      var angle = factor * PI;
      var nodeX = 50 + 33.08 * Math.cos(angle);
      var nodeY = 50 - 33.08 * Math.sin(angle);
      var key = factorKey(factor);
      var node = document.createElement(interactive ? "button" : "span");
      node.className = "point-node";
      node.style.setProperty("--x", nodeX + "%");
      node.style.setProperty("--y", nodeY + "%");
      node.dataset.factor = String(factor);

      if (state.mode === "combine") {
        var memberships = pointSeriesMemberships(key);
        if (memberships.length) {
          var emphasisIndex = state.selected.has(key) && state.phase === "series"
            ? state.seriesIndex
            : memberships[memberships.length - 1];
          node.classList.add("has-series");
          node.style.setProperty("--point-fill", seriesFill(memberships));
          node.style.setProperty("--point-border", SERIES_COLORS[emphasisIndex]);
          node.style.setProperty("--point-glow", SERIES_GLOWS[emphasisIndex]);
        }
      }

      if (interactive) {
        node.type = "button";
        node.setAttribute("aria-label", "Точка " + angleText(factor));
        node.setAttribute("aria-pressed", state.selected.has(key) ? "true" : "false");
        if (state.selected.has(key)) {
          node.classList.add("is-selected");
        }
        node.addEventListener("click", function () {
          togglePoint(factor);
        });
      } else if (state.mode === "points" && state.selected.has(key)) {
        node.classList.add("is-selected");
      } else if (state.mode === "formula" && target.has(key)) {
        node.classList.add("is-highlighted");
      }

      if (state.mode === "combine" && state.phase === "formula") {
        node.classList.add("is-locked");
      }

      elements.pointLayer.appendChild(node);
    });
  }

  function togglePoint(factor) {
    if (state.solved || (state.mode === "combine" && state.phase !== "series")) {
      return;
    }
    var key = factorKey(factor);
    if (state.selected.has(key)) {
      state.selected.delete(key);
    } else {
      state.selected.add(key);
    }
    if (state.mode === "combine" && state.seriesStatus[state.seriesIndex] === "idle") {
      state.seriesStatus[state.seriesIndex] = "active";
      renderPrompt(currentTask());
      renderLegend(currentTask());
    }
    markTaskStarted();
    hideFeedback();
    renderCircle(currentTask());
    updateSelectionCount();
  }

  function addLegendItem(label, color, muted) {
    var item = document.createElement("span");
    if (muted) {
      item.classList.add("is-muted");
    }
    var dot = document.createElement("i");
    dot.className = "legend-dot";
    if (color) {
      dot.style.setProperty("--legend-color", color);
      dot.classList.add("is-series");
    }
    item.appendChild(dot);
    item.appendChild(document.createTextNode(label));
    elements.circleLegend.appendChild(item);
  }

  function renderLegend(task) {
    elements.circleLegend.innerHTML = "";
    if (state.mode === "combine") {
      task.formulas.forEach(function (formula, index) {
        var suffix = state.seriesStatus[index] === "correct"
          ? " · верно"
          : state.seriesStatus[index] === "incorrect"
            ? " · ошибка"
          : state.phase === "series" && index === state.seriesIndex
            ? " · сейчас"
            : "";
        addLegendItem("Серия " + (index + 1) + suffix, SERIES_COLORS[index], index > state.seriesIndex && state.phase === "series");
      });
      return;
    }
    addLegendItem("доступная точка", "", false);
    addLegendItem(state.mode === "formula" ? "заданная точка" : "выбранная точка", "#6D4ACB", false);
  }

  function updateSelectionCount() {
    if (state.mode === "formula") {
      elements.selectionCount.textContent = "Задано: " + currentTask().target.length;
      return;
    }
    if (state.mode === "combine") {
      if (state.phase === "series") {
        elements.selectionCount.textContent = "Серия " + (state.seriesIndex + 1) + ": выбрано " + state.selected.size;
      } else {
        elements.selectionCount.textContent = "Всего точек: " + currentTask().target.length;
      }
      return;
    }
    elements.selectionCount.textContent = "Выбрано: " + state.selected.size;
  }

  function renderFormulaPreview() {
    var source = elements.formulaInput.value;
    if (source.trim()) {
      markTaskStarted();
    }
    elements.formulaPreview.innerHTML = "";
    if (!source.trim()) {
      var placeholder = document.createElement("span");
      placeholder.className = "preview-placeholder";
      placeholder.textContent = "Предпросмотр формулы";
      elements.formulaPreview.appendChild(placeholder);
      return;
    }
    try {
      elements.formulaPreview.innerHTML = formulaMathML(source, true);
    } catch (error) {
      var raw = document.createElement("span");
      raw.textContent = "t = " + source;
      elements.formulaPreview.appendChild(raw);
    }
  }

  function hideFeedback() {
    elements.feedback.hidden = true;
    elements.feedback.className = "feedback";
    elements.feedback.textContent = "";
  }

  function showFeedback(kind, message) {
    elements.feedback.hidden = false;
    elements.feedback.className = "feedback is-" + kind;
    elements.feedback.textContent = message;
  }

  function showPointError(task, expected, prefix) {
    var expectedSet = expected || targetSet(task);
    var missing = [];
    var extra = [];
    task.candidates.forEach(function (factor) {
      var key = factorKey(factor);
      if (expectedSet.has(key) && !state.selected.has(key)) {
        missing.push(angleText(factor));
      }
      if (!expectedSet.has(key) && state.selected.has(key)) {
        extra.push(angleText(factor));
      }
    });
    var parts = [];
    if (missing.length) {
      parts.push("Не отмечены: " + missing.join(", ") + ".");
    }
    if (extra.length) {
      parts.push("Лишние точки: " + extra.join(", ") + ".");
    }
    showFeedback("error", (prefix || "") + (parts.join(" ") || "Набор точек не совпадает с заданным."));
  }

  function completePointStage(task) {
    state.solved = true;
    markTaskStatus("correct");
    showFeedback("success", "Верно. " + task.explanation);
    elements.checkButton.textContent = "К следующему";
    elements.clearButton.disabled = true;
  }

  function advanceSeriesStage(task) {
    var completedIndex = state.seriesIndex;
    state.seriesStatus[completedIndex] = "correct";
    state.confirmedSeries.push(new Set(state.selected));
    state.selected = new Set();

    if (completedIndex + 1 < task.formulas.length) {
      state.seriesIndex += 1;
      elements.taskInstruction.textContent = "Серия " + (completedIndex + 1) + " верна. Теперь отметьте точки серии " + (state.seriesIndex + 1) + " другим цветом.";
      elements.checkButton.textContent = "Подтвердить серию " + (state.seriesIndex + 1);
      elements.clearButton.textContent = "Очистить серию";
      elements.circleTitle.textContent = "Отметьте серию " + (state.seriesIndex + 1);
      showFeedback("success", "Серия " + (completedIndex + 1) + " отмечена верно.");
      renderPrompt(task);
      renderCircle(task);
      renderLegend(task);
      updateSelectionCount();
      return;
    }

    state.phase = "formula";
    elements.formulaEditor.hidden = false;
    elements.taskInstruction.textContent = "Все серии отмечены верно. Теперь запишите одну общую формулу для всех найденных точек.";
    elements.checkButton.textContent = "Проверить формулу";
    elements.clearButton.textContent = "Очистить формулу";
    elements.circleTitle.textContent = "Все серии отмечены";
    showFeedback("success", "Все серии верны. Открылся ввод общей формулы.");
    renderPrompt(task);
    renderCircle(task);
    renderLegend(task);
    updateSelectionCount();
    window.setTimeout(function () {
      elements.formulaInput.focus();
    }, 0);
  }

  function checkPoints(task) {
    if (state.selected.size === 0) {
      showFeedback("error", "Сначала отметьте хотя бы одну точку на окружности.");
      return;
    }
    if (state.mode === "combine") {
      var expectedSeries = seriesTargetSet(task, state.seriesIndex);
      if (setsEqual(state.selected, expectedSeries)) {
        advanceSeriesStage(task);
        return;
      }
      recordWrongAttempt();
      state.seriesStatus[state.seriesIndex] = "incorrect";
      renderPrompt(task);
      renderLegend(task);
      showPointError(task, expectedSeries, "Серия " + (state.seriesIndex + 1) + ": ");
      return;
    }
    if (setsEqual(state.selected, targetSet(task))) {
      completePointStage(task);
      return;
    }
    recordWrongAttempt();
    showPointError(task);
  }

  function checkFormula(task) {
    var source = elements.formulaInput.value.trim();
    if (!source) {
      showFeedback("error", "Введите общую формулу.");
      elements.formulaInput.focus();
      return;
    }
    var actual;
    try {
      actual = setFromFormula(source);
    } catch (error) {
      recordWrongAttempt();
      showFeedback("error", "Формулу не удалось прочитать. Проверьте дробную черту, скобки и показатель степени.");
      return;
    }
    if (!setsEqual(actual, targetSet(task))) {
      recordWrongAttempt();
      showFeedback("error", "Эта формула задаёт другой набор точек. Проверьте начальный угол и шаг изменения параметра.");
      return;
    }
    state.solved = true;
    markTaskStatus("correct");
    showFeedback("success", "Верно. Формула задаёт весь требуемый набор точек и не добавляет лишних.");
    elements.checkButton.textContent = "К следующему";
    elements.clearButton.disabled = true;
    elements.formulaInput.disabled = true;
    elements.keyboard.querySelectorAll("button").forEach(function (button) {
      button.disabled = true;
    });
  }

  function nextTask() {
    saveCurrentDraft();
    var nextIndex = nextOpenTaskIndex();
    if (nextIndex === -1) {
      showCompletion();
      return;
    }
    state.index = nextIndex;
    renderTask();
  }

  function handleCheck() {
    var task = currentTask();
    if (state.solved) {
      nextTask();
      return;
    }
    if (state.mode === "formula" || (state.mode === "combine" && state.phase === "formula")) {
      checkFormula(task);
      return;
    }
    checkPoints(task);
  }

  function clearAnswer() {
    if (state.solved) {
      return;
    }
    hideFeedback();
    if (state.mode === "formula" || (state.mode === "combine" && state.phase === "formula")) {
      elements.formulaInput.value = "";
      renderFormulaPreview();
      elements.formulaInput.focus();
      return;
    }
    state.selected.clear();
    renderCircle(currentTask());
    updateSelectionCount();
  }

  function showHint() {
    if (state.solved) {
      return;
    }
    if (state.mode === "points") {
      showFeedback("hint", "Подставьте несколько целых значений k и приведите каждый угол к промежутку от 0 до 2π.");
      return;
    }
    if (state.mode === "combine" && state.phase === "series") {
      showFeedback("hint", "Сейчас работайте только с серией " + (state.seriesIndex + 1) + ": подставьте несколько целых значений параметра и отметьте её точки на одном обороте.");
      return;
    }
    showFeedback("hint", "Найдите наименьший положительный шаг между соседними точками. Он задаёт коэффициент при k.");
  }

  function markTaskStatus(status) {
    state.taskStatus[state.mode][state.index] = status;
    updateProgress();
  }

  function recordWrongAttempt() {
    state.wrongAttempts[state.mode] += 1;
    markTaskStatus("incorrect");
  }

  function markTaskStarted() {
    if (state.taskStatus[state.mode][state.index] === "idle") {
      markTaskStatus("active");
    }
  }

  function getStatusCounts(mode) {
    var counts = { correct: 0, incorrect: 0, active: 0, idle: 0 };
    state.taskStatus[mode].forEach(function (status) {
      counts[status] += 1;
    });
    return counts;
  }

  function updateProgress() {
    var total = tasks[state.mode].length;
    var counts = getStatusCounts(state.mode);
    elements.progressText.textContent = "Задание " + (state.index + 1) + " из " + total;
    elements.correctCount.textContent = String(counts.correct);
    elements.incorrectCount.textContent = String(state.wrongAttempts[state.mode]);
    elements.activeCount.textContent = String(counts.active);
    elements.idleCount.textContent = String(counts.idle);
    elements.taskStatusList.innerHTML = "";

    state.taskStatus[state.mode].forEach(function (status, index) {
      var item = document.createElement("button");
      var stateLabel = status === "correct"
        ? "выполнено верно"
        : status === "incorrect"
          ? "есть ошибка"
          : status === "active"
            ? "в работе"
            : "не начато";
      item.className = "task-status-item is-" + status;
      item.type = "button";
      item.setAttribute("aria-label", "Открыть задание " + tasks[state.mode][index].id + ": " + stateLabel);
      item.title = "Задание " + tasks[state.mode][index].id + " — " + stateLabel;
      item.textContent = String(index + 1);
      if (index === state.index) {
        item.classList.add("is-current");
        item.setAttribute("aria-current", "step");
      }
      item.addEventListener("click", function () {
        goToTask(index);
      });
      elements.taskStatusList.appendChild(item);
    });
    elements.taskStatusList.setAttribute(
      "aria-label",
      "Заданий: " + total + ". Верно: " + counts.correct + ". Ошибочных проверок: " + state.wrongAttempts[state.mode] + ". В работе: " + counts.active + ". Не начато: " + counts.idle + "."
    );
  }

  function saveCurrentDraft() {
    state.drafts[state.mode][state.index] = {
      selected: Array.from(state.selected),
      phase: state.phase,
      seriesIndex: state.seriesIndex,
      confirmedSeries: state.confirmedSeries.map(function (series) {
        return Array.from(series);
      }),
      seriesStatus: state.seriesStatus.slice(),
      solved: state.solved,
      formula: elements.formulaInput.value
    };
  }

  function restoreCurrentDraft(task) {
    var draft = state.drafts[state.mode][state.index];
    if (!draft) {
      state.selected = new Set();
      state.phase = state.mode === "formula" ? "formula" : state.mode === "combine" ? "series" : "points";
      state.seriesIndex = 0;
      state.confirmedSeries = [];
      state.seriesStatus = state.mode === "combine"
        ? task.formulas.map(function () { return "idle"; })
        : [];
      state.solved = false;
      return "";
    }

    state.selected = new Set(draft.selected || []);
    state.phase = draft.phase;
    state.seriesIndex = draft.seriesIndex || 0;
    state.confirmedSeries = (draft.confirmedSeries || []).map(function (series) {
      return new Set(series);
    });
    state.seriesStatus = (draft.seriesStatus || []).slice();
    state.solved = Boolean(draft.solved);
    return draft.formula || "";
  }

  function configureTaskStage(task, config) {
    var formulaVisible = state.mode === "formula" || (state.mode === "combine" && state.phase === "formula");
    elements.formulaEditor.hidden = !formulaVisible;
    elements.formulaInput.disabled = state.solved;
    elements.keyboard.querySelectorAll("button").forEach(function (button) {
      button.disabled = state.solved;
    });
    elements.clearButton.disabled = state.solved;
    elements.hintButton.disabled = state.solved;

    if (state.solved) {
      elements.checkButton.textContent = "К следующему";
      elements.clearButton.textContent = state.mode === "combine" ? "Очистить формулу" : "Очистить";
      elements.circleTitle.textContent = "Задание выполнено";
      elements.taskInstruction.textContent = "Ответ верен. Можно перейти к любому заданию по плашкам сверху.";
      return;
    }

    if (state.mode === "points") {
      elements.circleTitle.textContent = config.circleTitle;
      elements.taskInstruction.textContent = "Выберите все подходящие точки на одном обороте и нажмите «Проверить».";
      elements.checkButton.textContent = "Проверить";
      elements.clearButton.textContent = "Очистить";
      return;
    }

    if (state.mode === "formula") {
      elements.circleTitle.textContent = config.circleTitle;
      elements.taskInstruction.textContent = "Точки выделены на окружности. Запишите одну общую формулу.";
      elements.checkButton.textContent = "Проверить";
      elements.clearButton.textContent = "Очистить";
      return;
    }

    if (state.phase === "formula") {
      elements.circleTitle.textContent = "Все серии отмечены";
      elements.taskInstruction.textContent = "Все серии отмечены верно. Теперь запишите одну общую формулу для всех найденных точек.";
      elements.checkButton.textContent = "Проверить формулу";
      elements.clearButton.textContent = "Очистить формулу";
      return;
    }

    elements.circleTitle.textContent = "Отметьте серию " + (state.seriesIndex + 1);
    elements.checkButton.textContent = "Подтвердить серию " + (state.seriesIndex + 1);
    elements.clearButton.textContent = "Очистить серию";
    if (state.seriesIndex === 0) {
      elements.taskInstruction.textContent = "Отметьте точки только первой серии и нажмите «Подтвердить серию 1».";
    } else {
      elements.taskInstruction.textContent = "Предыдущие серии сохранены. Отметьте точки серии " + (state.seriesIndex + 1) + " другим цветом.";
    }
  }

  function renderTask() {
    var task = currentTask();
    var config = modeConfig[state.mode];
    var formulaDraft = restoreCurrentDraft(task);

    elements.modeTabs.forEach(function (tab) {
      var active = tab.dataset.mode === state.mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-current", active ? "page" : "false");
    });
    elements.modeLabel.textContent = config.label;
    elements.taskType.textContent = config.type;
    elements.taskId.textContent = task.id;
    elements.taskTitle.textContent = config.title;
    elements.formulaInput.value = formulaDraft;
    configureTaskStage(task, config);

    hideFeedback();
    renderPrompt(task);
    renderCircle(task);
    renderLegend(task);
    renderFormulaPreview();
    updateSelectionCount();
    updateProgress();
    if (state.solved) {
      showFeedback("success", "Задание выполнено верно.");
    }
  }

  function switchMode(mode) {
    if (!tasks[mode] || mode === state.mode) {
      return;
    }
    saveCurrentDraft();
    state.mode = mode;
    var openIndex = firstOpenTaskIndex(mode);
    state.index = openIndex === -1 ? 0 : openIndex;
    renderTask();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showCompletion() {
    var total = tasks[state.mode].length;
    var counts = getStatusCounts(state.mode);
    var attempts = state.wrongAttempts[state.mode];
    var attemptsText = attempts === 0
      ? "Все ответы получены без ошибочных проверок."
      : "Ошибочных проверок: " + attempts + ". Повторите задания, в которых пришлось исправлять начальный угол или шаг.";
    elements.completionText.textContent = "Выполнено верно: " + counts.correct + " из " + total + ". " + attemptsText;
    var modeIndex = MODE_ORDER.indexOf(state.mode);
    elements.nextModeButton.textContent = modeIndex === MODE_ORDER.length - 1 ? "Начать сначала" : "Следующий раздел";
    state.lastFocus = document.activeElement;
    elements.completionDialog.hidden = false;
    elements.repeatButton.focus();
  }

  function closeCompletion() {
    elements.completionDialog.hidden = true;
    if (state.lastFocus && typeof state.lastFocus.focus === "function") {
      state.lastFocus.focus();
    }
  }

  function repeatMode() {
    closeCompletion();
    state.index = 0;
    state.wrongAttempts[state.mode] = 0;
    state.taskStatus[state.mode] = tasks[state.mode].map(function () { return "idle"; });
    state.drafts[state.mode] = tasks[state.mode].map(function () { return null; });
    renderTask();
  }

  function firstOpenTaskIndex(mode) {
    return state.taskStatus[mode].findIndex(function (status) {
      return status !== "correct";
    });
  }

  function nextOpenTaskIndex() {
    return nextOpenIndex(state.taskStatus[state.mode], state.index);
  }

  function nextOpenIndex(statuses, currentIndex) {
    var total = statuses.length;
    for (var offset = 1; offset <= total; offset += 1) {
      var index = (currentIndex + offset) % total;
      if (statuses[index] !== "correct") {
        return index;
      }
    }
    return -1;
  }

  function goToTask(index) {
    if (index < 0 || index >= tasks[state.mode].length || index === state.index) {
      return;
    }
    saveCurrentDraft();
    state.index = index;
    renderTask();
  }

  function goToNextMode() {
    closeCompletion();
    var currentIndex = MODE_ORDER.indexOf(state.mode);
    state.mode = MODE_ORDER[(currentIndex + 1) % MODE_ORDER.length];
    var openIndex = firstOpenTaskIndex(state.mode);
    state.index = openIndex === -1 ? 0 : openIndex;
    renderTask();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function insertAtCursor(text) {
    var input = elements.formulaInput;
    if (input.disabled) {
      return;
    }
    var start = input.selectionStart == null ? input.value.length : input.selectionStart;
    var end = input.selectionEnd == null ? input.value.length : input.selectionEnd;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    var nextPosition = start + text.length;
    input.focus();
    input.setSelectionRange(nextPosition, nextPosition);
    renderFormulaPreview();
    hideFeedback();
  }

  function backspaceAtCursor() {
    var input = elements.formulaInput;
    if (input.disabled) {
      return;
    }
    var start = input.selectionStart == null ? input.value.length : input.selectionStart;
    var end = input.selectionEnd == null ? input.value.length : input.selectionEnd;
    if (start === end && start > 0) {
      start -= 1;
    }
    input.value = input.value.slice(0, start) + input.value.slice(end);
    input.focus();
    input.setSelectionRange(start, start);
    renderFormulaPreview();
    hideFeedback();
  }

  elements.modeTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchMode(tab.dataset.mode);
    });
  });
  elements.checkButton.addEventListener("click", handleCheck);
  elements.clearButton.addEventListener("click", clearAnswer);
  elements.hintButton.addEventListener("click", showHint);
  elements.formulaInput.addEventListener("input", function () {
    renderFormulaPreview();
    hideFeedback();
  });
  elements.formulaInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCheck();
    }
  });
  elements.keyboard.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) {
      return;
    }
    if (button.dataset.action === "backspace") {
      backspaceAtCursor();
      return;
    }
    insertAtCursor(button.dataset.key || "");
  });
  elements.repeatButton.addEventListener("click", repeatMode);
  elements.nextModeButton.addEventListener("click", goToNextMode);
  elements.completionDialog.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
      var focusables = [elements.repeatButton, elements.nextModeButton];
      var index = focusables.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        focusables[1].focus();
      } else if (!event.shiftKey && index === 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    }
  });

  renderTask();
})();
