console.log("Email Generator Assistant loaded");


function creatingAIButton(){
    // Find an existing Gmail button to clone
    const existingButton = document.querySelector('.T-I.J-J5-Ji.aoO.T-I-atl.L3');
    if (existingButton) {
        const button = existingButton.cloneNode(true);
        button.innerHTML = 'AI-Reply';
        button.setAttribute('data-tooltip','Generate AI Reply');
        button.style.marginRight = '8px';
        return button;
    }
    

}


// function creatingAIButton(){
//     const button = document.createElement('div');
//     button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
//     button.style.marginRight = '8px';
//     button.innerHTML = 'AI-Reply';
//     button.setAttribute('role','button');
//     button.setAttribute('data-tooltip','Generate AI Reply');
//     return button;

// }

function getEmailContent(){
      const selectors = [
        '.a3s.aiL ',
        '.h7',
        '.gmail_qoute',
        '[role="presentation"]'
    ];
    for(const selector of selectors){
        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        return '';

    }

}

function findComposeToolBar(){
    const selectors = [
        '.aDh',
        '.btC',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for(const selector of selectors){
        const toolbar =document.querySelector(selector);
        if(toolbar){
            return toolbar;
        }
        return null;

    }

}

function injectButton(){

    const existingButton = document.querySelector('.ai-response');
    if(existingButton) existingButton.remove()

    const toolbar = findComposeToolBar();
    if(!toolbar){
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar found, creating ai button");
    const button = creatingAIButton();
    button.classList.add('ai-response');

    button.addEventListener('click', async ()=>{
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                   emailContent: emailContent,
                    tone: "casual"
                }
                    

                )

            });

            if(!response.ok){
                throw new Error('API request failed');
            }

            const generatedResponse = await response.text();
            const composeBox = document.querySelector('[role="textbox"],[g_editable="true"]');
            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText',false,generatedResponse)
            }else{
                console.error("ComposeBox not found");
            }
        } catch (error) {
            console.error(error)
            alert("Failed to generate response");
        }finally{
            button.innerHTML = 'AI-Reply';
            button.disabled = false;
        }

    });


    toolbar.insertBefore(button,toolbar.firstChild)
   
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node=>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
           
        );
       

        if(hasComposeElements){
            console.log("Composed Window Detected");
            setTimeout(injectButton,500);
        }
    }
});



observer.observe(document.body,{
    childList: true,
    subtree: true
});