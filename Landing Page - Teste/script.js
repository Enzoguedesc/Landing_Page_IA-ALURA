
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('open');
        });

        // Lógica para o novo Gerador de Dicas Financeiras usando a API do Gemini
        const generateTipButton = document.getElementById('generate-tip-button');
        const tipInput = document.getElementById('tip-input');
        const tipOutput = document.getElementById('tip-output');

        // Define a função de retry com backoff exponencial
        const withExponentialBackoff = async (fn, maxRetries = 5, delay = 1000) => {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    return await fn();
                } catch (error) {
                    if (i === maxRetries - 1) throw error;
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        };

        generateTipButton.addEventListener('click', async () => {
            const userPrompt = tipInput.value.trim();
            if (!userPrompt) {
                tipOutput.textContent = "Por favor, digite sua pergunta para gerar uma dica financeira.";
                tipOutput.classList.remove('hidden');
                tipOutput.classList.add('visible');
                return;
            }

            tipOutput.textContent = "Gerando sua dica financeira...";
            tipOutput.classList.remove('hidden');
            tipOutput.classList.add('visible');

            try {
                // Prepara a chamada para a API do Gemini
                let chatHistory = [];
                const prompt = `Gere uma dica financeira concisa, informativa e fácil de entender baseada na seguinte pergunta: "${userPrompt}". A resposta deve ser direta e ter no máximo 150 palavras. Use todo seu conhecimento sobre o mundo de financas e investimento.`;
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                const response = await withExponentialBackoff(async () => {
                    return await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                });

                if (!response.ok) {
                    throw new Error(`Erro de API: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    tipOutput.textContent = text;
                } else {
                    tipOutput.textContent = "Desculpe, não foi possível gerar uma dica. Por favor, tente novamente mais tarde.";
                }

            } catch (error) {
                console.error("Erro ao chamar a API do Gemini:", error);
                tipOutput.textContent = "Ocorreu um erro ao gerar a dica. Verifique a conexão e tente novamente.";
            } finally {
                // A classe 'visible' garante que o conteúdo não seja escondido
            }
        });
