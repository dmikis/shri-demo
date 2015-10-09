function main() {
    var c = document.querySelector('canvas');

    var QUAD_DATA = new Float32Array([
    // position (XY)     tex coords (ST)
        -1, -1,            0.0, 1.0,
        -1,  1,            0.0, 0.0,
         1, -1,            1.0, 1.0,
         1, -1,            1.0, 1.0,
        -1,  1,            0.0, 0.0,
         1,  1,            1.0, 0.0
    ]);

    var VS_SOURCE = [
      'attribute vec2 vertexPosition;',
      'attribute vec2 vertexTexCoord;',

      'varying vec2 texCoord;',

      'void main(void) {',
        'gl_Position = vec4(vertexPosition, 0.0, 1.0);',
        'texCoord = vertexTexCoord;',
      '}'
    ].join('');

    var FS_SOURCE = [
      'precision mediump float;',

      'varying vec2 texCoord;',

      'uniform sampler2D texture;',

      'void main(void) {',
        'gl_FragColor = texture2D(texture, texCoord);',
      '}'
    ].join('');

    // Получаем контекст
    var gl = c.getContext('webgl') ||
      c.getContext('experimental-webgl') ||
      c.getContext('webkit-3d');

    // Устанавливаем размер области, в которой будем рисовать
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // "Заливаем" канвас черным цветом
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Создаем буфер с данными прямоугольника
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_DATA, gl.STREAM_DRAW);

    // Создаем текстуру, которую будем накладывать на прямоугольник
    // и связываем ее в первым текстурным юнитом
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.querySelector('img'));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Создаем вершинный шейдер
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VS_SOURCE);
    gl.compileShader(vs);

    // Создаем пиксельный (фрагментный) шейдер
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FS_SOURCE);
    gl.compileShader(fs);

    // Создаем программу и "собираем" в нее наши шейдеры
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Связываем парамеры программы с буфером данных
    var vertexPositionAttr = gl.getAttribLocation(program, 'vertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttr);
    gl.vertexAttribPointer(vertexPositionAttr, 2, gl.FLOAT, true, 16, 0);

    var vertexTexCoordAttr = gl.getAttribLocation(program, 'vertexTexCoord');
    gl.enableVertexAttribArray(vertexTexCoordAttr);
    gl.vertexAttribPointer(vertexTexCoordAttr, 2, gl.FLOAT, true, 16, 8);

    // Связываем юниформ в тесктурой
    var textureUniform = gl.getUniformLocation(program, 'texture');
    gl.uniform1i(textureUniform, 0);


    // Рисуем!
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Ждем, пока дорисуем :)
    gl.flush();
    gl.finish();
}
