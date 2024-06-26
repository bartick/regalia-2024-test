import { useUser } from "@/lib/store/user";
import { eventReg } from "@/utils/functions/eventReg";
import { validateReg } from "@/utils/functions/validate";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import FormElement from "../common/FormElement";
import Link from "next/link";
import { clickSound } from "@/utils/functions";
import { BeatLoader, PuffLoader } from "react-spinners";


const EventRegForm = ({
    isOpen,
    onClose,
    eventDetails,
  }: {
    isOpen: boolean;
    onClose: () => void;
    eventDetails: any;
  }) => {
    const router = useRouter();
    const eventId = eventDetails?.id;
    const [disabled, setDisabled] = useState<boolean>(false);
    const [inputs, setInputs] = useState<any>({
      teamName: "",
      transactionId: "",
      transactionSSfileName: "",
      teamLeadPhone: "",
      teamLeadEmail: "",
      teamLeadName: "",
      regMode: "",
      college: "",
    });
  
    const [file, setFile] = useState<any>(null);
    const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>
    ) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setInputs((prevInputs: any) => ({
        ...prevInputs,
        transactionSSfileName: selectedFile.name,
      }));
    };

  
    const user = useUser((state) => state.user);
    const minTeamMember = eventDetails?.min_team_member;
    const maxTeamMember = eventDetails?.max_team_member;
    const [isSWCcleared, setIsSWCcleared] = useState<any>(null);
    useEffect(() => {
      if (user) {
        setInputs((prevInputs: any) => ({
          ...prevInputs,
          teamLeadPhone: user.phone,
          teamLeadEmail: user.email,
          teamName: maxTeamMember > 1 ? "" : user.name, // Set teamName as blank if maxTeamMember > 1
          teamLeadName: user.name,
            college: isSWCcleared ? "RCCIIT" : prevInputs.college,
        }));
      }
    }, [user, maxTeamMember,isSWCcleared]);
  
   
    const [participants, setParticipants] = useState<any>([]);
    useEffect(() => {
      if (minTeamMember !== undefined && minTeamMember !== null) {
        const blankParticipants = [];
        for (let i = 0; i < minTeamMember; i++) {
          blankParticipants.push({ phone: "", email: "", name: "" });
        }
        setParticipants(blankParticipants);
      }
    }, [minTeamMember]);
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>
    ) => {
      const { name, value } = e.target;
      setInputs((prevInputs: any) => ({
        ...prevInputs,
        [name]: value,
      }));
      if (maxTeamMember == 1) {
        setInputs((prevInputs: any) => ({
          ...prevInputs,
          teamLeadName: prevInputs.teamName,
        }));
      }
    };
  
    const handleEmailChange = (index: number, value: string) => {
      const updatedParticipants = [...participants];
      updatedParticipants[index].email = value;
      if (index == 0) {
        updatedParticipants[0].email = inputs.teamLeadEmail;
      }
      setParticipants(updatedParticipants);
    };
    const handleNameChange = (index: number, value: string) => {
      const updatedParticipants = [...participants];
      updatedParticipants[index].name = value;
      if (index == 0) {
        updatedParticipants[0].name = inputs.teamLeadName;
      }
      setParticipants(updatedParticipants);
    };
  
    const handlePhoneChange = (index: number, value: string) => {
      const updatedParticipants = [...participants];
      updatedParticipants[index].phone = value;
      setParticipants(updatedParticipants);
    };
  
    const addParticipant = () => {
      setParticipants([...participants, { phone: "", name: "" }]);
    };
    const removeParticipant = (index: number) => {
      const updatedParticipants = [...participants];
      updatedParticipants.splice(index, 1);
      setParticipants(updatedParticipants);
    };
  
    const [generalErrors, setGeneralErrors] = useState<any>({});
    const [teamErrors, setTeamErrors] = useState<any>({});
    let teamMemberCountError = "";
    const handleSubmit = async () => {
      clickSound();
      setDisabled(true);
      try {
        const res = validateReg(
          inputs,
          participants,
          maxTeamMember,
          file,
          isSWCcleared
        );
        console.log(res);

        const allFieldsEmpty =
          Object.values(res.errors).every((value) => value === "") &&
          res.teamErrors.every(
            (participant: any) =>
              participant.name === "" && participant.phone === ""
          );
        if (allFieldsEmpty) {
          await eventReg(inputs, participants, file, eventId, isSWCcleared);
          toast.success("Registration Successful");
          onClose();
          router.push("/dashboard");
        }
        else{
          if (res.errors || res.teamErrors) {
            setGeneralErrors(res.errors);
            setTeamErrors(res.teamErrors);
            toast.error("Fill all the fields accurately !");
            return;
          }
        }
     setDisabled(false);
      } catch (err) {
        console.log(err);
        toast.error("Registration Failed !");
        setDisabled(false);
      }
      setDisabled(false);
    };
  
    return (
      <>
        {isOpen && (
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[50]">
            <div
              className={`bg-body border-regalia border-y-2 p-4 rounded-lg ${
                maxTeamMember > 1 && eventDetails.register_through_portal
                  ? "h-[80vh] md:h-[70vh]"
                  : eventDetails.register_through_portal
                  ? "h-[70vh]"
                  : ""
              }  w-[95%] flex flex-col items-start lg:w-1/2 lg:px-32 lg:py-8`}
            >
              <div className="w-full flex flex-row mb-2 items-center justify-between">
                <h2 className="text-md font-hollirood tracking-widest lg:text-lg font-semibold">
                  Registration of Event
                </h2>
                <h2
                  onClick={onClose}
                  className="bg-regalia text-black md:py-2 md:px-3 px-2 py-1 -mr-3 hover:bg-black hover:text-regalia hover:border-regalia border-2 border-black   text-sm font-semibold rounded-full cursor-pointer"
                >
                  X
                </h2>
              </div>
            
              {eventDetails.register_through_portal ? (
                <div className="flex w-full pt-2 overflow-x-hidden flex-col  items-start gap-4 overflow-y-scroll text-sm lg:text-lg">
                  <FormElement
                    type="text"
                    disabled={maxTeamMember > 1 ? false : true}
                    name={maxTeamMember > 1 ? "Team Name" : "Name"}
                    value={inputs.teamName}
                    id="teamName"
                    onChange={handleInputChange}
                    width="100%"
                  />
                  <h1 className="text-red-600 font-semibold text-xs">
                    {generalErrors.teamName}
                  </h1>
                  <FormElement
                    type="number"
                    disabled={maxTeamMember > 1 ? true : true}
                    name={maxTeamMember > 1 ? "Team Lead Phone" : "Phone"}
                    value={inputs.teamLeadPhone}
                    id="teamLeadPhone"
                    onChange={handleInputChange}
                    width="100%"
                  />
                  <h1 className="text-red-600 font-semibold text-xs">
                    {generalErrors.teamLeadPhone}
                  </h1>
  
                  {maxTeamMember > 1 && (
                    <FormElement
                      type="text"
                      disabled={maxTeamMember > 1 ? true : true}
                      name={maxTeamMember > 1 ? "Team Lead Name" : "Name"}
                      value={inputs.teamLeadName}
                      id="teamLeadName"
                      onChange={handleInputChange}
                      width="100%"
                    />
                  )}
                  <h1 className="text-red-600 font-semibold text-xs">
                    {generalErrors.teamLeadName}
                  </h1>
                  <FormElement
                    type="email"
                    disabled={maxTeamMember > 1 ? true : true}
                    name={maxTeamMember > 1 ? "Team Lead Email" : "Email"}
                    value={inputs.teamLeadEmail}
                    id="teamLeadEmail"
                    onChange={handleInputChange}
                    width="100%"
                  />
                  <h1 className="text-red-600 font-semibold text-xs">
                    {generalErrors.teamLeadEmail}
                  </h1>
                  <FormElement
                    type="text"
                    name={"College"}
                    disabled={isSWCcleared ? true : false}
                    value={isSWCcleared ? "RCCIIT" : inputs.college}
                    id="college"
                    onChange={handleInputChange}
                    width="100%"
                  />
                     <h1 className="text-red-600 font-semibold text-xs">
                    {generalErrors.college}
                  </h1>
                  {!isSWCcleared && (
                    <>
                    
                      <img
                        src={"https://i.imgur.com/Qg2ueWW.jpg"}
                        width={350}
                        className="mx-auto "
                        height={100}
                        alt=""
                      />
                      <h1 className="mx-auto font-hollirood tracking-widest text-center font-semibold text-lg">
                        Pay Now :{" "}
                        <span className="font-semibold text-green-600">
                          ₹ {eventDetails?.registration_fees}
                        </span>
                      </h1>
                      <FormElement
                        type="text"
                        name="Transaction Id"
                        value={inputs.transactionId}
                        id="transactionId"
                        onChange={handleInputChange}
                        width="100%"
                      />
                      <h1 className="text-red-600 font-semibold text-xs">
                        {generalErrors.transactionId}
                      </h1>
                      <div className="flex flex-row gap-2 flex-wrap text-sm items-center">
                        <label
                          htmlFor="transactionSSfileName"
                          className="font-semibold font-hollirood tracking-widest"
                        >
                          Payment Screenshot :
                        </label>
                        <input
                          type="file"
                          id="transactionSSfileName"
                          className="font-semibold font-hollirood bg-regalia text-black tracking-widest"
                          onChange={handleFileChange}
                        />
                        <h1 className="text-red-600 font-semibold text-xs">
                          {generalErrors.transactionSSfileName}
                        </h1>
                      </div>
                    </>
                  )}
  
                  {maxTeamMember > 1 && (
                    <div className="flex flex-col items-center gap-5">
                      <h1 className="font-semibold">Add Team Participants</h1>
                      {teamMemberCountError !== "" && (
                        <h1 className="text-red-600 font-semibold text-xs">
                          {teamMemberCountError}
                        </h1>
                      )}
                      {participants.map((participant: any, index: number) => (
                        <div
                          key={index}
                          className="flex flex-row   items-center gap-10 flex-wrap border-2 text-sm  px-10 py-2 pb-5 border-regalia rounded-lg"
                        >
                          <div className="flex flex-col  items-start gap-2">
                            <label htmlFor="" className="font-semibold font-hollirood tracking-widest">
                              {index == 0 ? "Team Lead" : `Person ${index + 1}`}
                            </label>
  
                            <div className="flex flex-col items-start gap-3">
                              {/* <div className="flex flex-row flex-wrap gap-2 font-semibold">
                                <label htmlFor="email">Email :</label>
                                <input
                                  type="text"
                                  id="email"
                                  value={
                                    index == 0
                                      ? (participant.email = inputs.teamLeadEmail)
                                      : participant.email
                                  }
                                  disabled={index == 0 ? true : false}
                                  onChange={(e) =>
                                    handleEmailChange(index, e.target.value)
                                  }
                                  className="border-black px-2 py-1 max-md:w-full rounded-lg"
                                  placeholder="Email"
                                />
                                {teamErrors && teamErrors[index] && (
                                  <h1 className="text-red-600 font-semibold text-xs">
                                    {teamErrors[index].email}
                                  </h1>
                                )}
                              </div> */}
  
                              <div className="flex flex-row flex-wrap gap-2 font-semibold">
                                <label htmlFor="name" className="font-retrolight tracking-widest">Name :</label>
                                <input
                                  type="text"
                                  id="name"
                                  disabled={index == 0 ? true : false}
                                  value={
                                    index == 0
                                      ? (participant.name = inputs.teamLeadName)
                                      : participant.name
                                  }
                                  onChange={(e) =>
                                    handleNameChange(index, e.target.value)
                                  }
                                  className={`w-full border-b rounded-xl border-regalia px-2 py-1 max-md:w-full focus:border-b bg-transparent `}
                                />
                                {teamErrors && teamErrors[index] && (
                                  <h1 className="text-red-600 font-semibold text-xs">
                                    {teamErrors[index].name}
                                  </h1>
                                )}
                              </div>
  
                              <div className="flex flex-row flex-wrap gap-2 font-semibold">
                                <label htmlFor="phone" className="font-retrolight tracking-widest">Phone :</label>
                                <input
                                  type="text"
                                  disabled={index == 0 ? true : false}
                                  value={
                                    index == 0
                                      ? (participant.phone = inputs.teamLeadPhone)
                                      : participant.phone
                                  }
                                  onChange={(e) =>
                                    handlePhoneChange(index, e.target.value)
                                  }
                                  className={`w-full border-b rounded-xl border-regalia px-2 py-1 max-md:w-full focus:border-b bg-transparent `}
                                />
                                {teamErrors && teamErrors[index] && (
                                  <h1 className="text-red-600 font-semibold text-xs">
                                    {teamErrors[index].phone}
                                  </h1>
                                )}
                              </div>
                            </div>
                          </div>
  
                          {participants.length > minTeamMember && (
                            <button
                              onClick={() => removeParticipant(index)}
                              className="border-2 border-regalia text-regalia rounded-full px-2 py-1 text-xs lg:text-sm font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      {participants.length < maxTeamMember && (
                        <button
                          onClick={addParticipant}
                          className="border-2 mt-3 font-hollirood tracking-widest border-regalia  px-5 py-1 rounded-full font-semibold bg-regalia text-black hover:bg-black hover:border-regalia hover:text-regalia"
                        >
                          Add Person
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <Link
                    href={eventDetails.registration_link}
                    target="_blank"
                    className="border-2 mt-3 font-hollirood tracking-widest border-regalia  px-5 py-1 rounded-full font-semibold bg-regalia text-black hover:bg-black hover:border-regalia hover:text-regalia"
                  >
                    Fill Form
                  </Link>
                </div>
              )}
              {eventDetails.register_through_portal ? (
                <div className="flex flex-row items-center pt-5 flex-wrap justify-between w-full">
                  <button
                    className="border-2 mt-3 font-hollirood tracking-widest border-regalia  px-5 py-1 rounded-full font-semibold bg-regalia text-black hover:bg-black hover:border-regalia hover:text-regalia"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button
                  disabled={disabled}
                    className="border-2 mt-3 font-hollirood tracking-widest border-regalia  px-5 py-1 rounded-full font-semibold bg-regalia text-black hover:bg-black hover:border-regalia hover:text-regalia" // hover:bg-white hover:text-black
                    onClick={handleSubmit}
                  >
                    {
                      disabled ? 
                      <BeatLoader color="black" size={20} />
                      : "Submit"
                    }
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
            <Toaster position="bottom-right"  />
          </div>
        )}
      </>
    );
  };

export default EventRegForm;