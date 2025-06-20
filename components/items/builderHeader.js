import React from 'react';
import styles from '../../styles/BuilderHeader.module.css';
import EditIcon from '@mui/icons-material/Edit';

export default function BuilderHeader(data) {
    let text = data.text;
    let setText = data.setText;

    const [editing, setEditing] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        if (data.parentLoaded && data.build) {
            let buildParts = (data.build)[0].split("&");
            let tempText = (buildParts.find(str => str.includes("name="))?.split("name=")[1]);
            if(tempText === undefined) tempText = "Monumenta Builder";
            setText(decodeURIComponent(tempText));
            setLoaded(true);
        }
    }, [data.parentLoaded]);

    function editButtonClicked(e){
        setEditing(true);
    }

    function hasfocus(e){
        e.target.select();
    }

    function keydown(e){
        if (e.key === "Enter" || e.key === "Escape") {
            stopEditing();
        }
    }

    function lostfocus(e){
        stopEditing();
    }

    function stopEditing(){
        setEditing(false);
        if(text.trim() === "") setText("Monumenta Builder");
        // document.getElementById("buildForm").sendUpdate(); // forces url to update // doesnt work
    }

    function textchanged(e){
        setText(e.target.value);
    }

    function getPlaceholderBuildName() {
        // temporarily puts the name until useState loads, everything else is populated, etc
        try {
            return decodeURIComponent((data.build)[0].split("&").find(str => str.includes("name="))?.split("name=")[1] || "Monumenta Builder")
        } catch (e) {
            return "Monumenta Builder"
        }
    }

    return (
        <div className="row mb-4">
            <div className="col-12 text-center">
                <span className={styles.builderHeader}>
                    {
                        editing
                        ? <input type="text" value={text} 
                            onChange={textchanged} onKeyDown={keydown} spellCheck="false" 
                            className={styles.theTextbox} autoFocus onFocus={hasfocus} onBlur={lostfocus} />
                        : <h1 className={styles.builderHeaderText}>{
                            loaded ? text : getPlaceholderBuildName()
                        }</h1>
                    }
                    <span className={styles.spacer}></span>
                    <EditIcon className={styles.builderHeaderEditIcon} fontSize="large" onClick={editButtonClicked}/>
                </span>
            </div>
        </div>
    )
}