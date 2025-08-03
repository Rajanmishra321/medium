import axios from "axios";
import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom"
import { SignupInput } from "rm347711-common";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signin" | "signup" }) => {
    const [postInputs, setPostInputs] = useState<SignupInput>({
        email: "",
        password: "",
    })
    const navigate = useNavigate()

    async function sendRequest() {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type == "signup" ? "signup" : "signin"}`,postInputs)
            const jwt = response.data;
            console.log(jwt)
            localStorage.setItem('token',jwt.jwt)
            navigate('/blog')
        } catch (error) {
            alert("something went wrong")
        }
    }



    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="px-10">
                    <div className="text-3xl font-extrabold">
                        {type == "signup" ? "Create an account" : "Welcome back"}
                    </div>
                    <div className="text-slate-400">
                        {type == "signin" ? "Don't have an account" : "Already have an account?"}
                        <Link className="pl-2 underline" to={type == "signin" ? "/signup" : "/signin"}>
                            {type == "signin" ? "Sign up" : "Sign in"}
                        </Link>
                    </div>
                </div>
                <div>
                    <div className="mt-10">
                        <LabelledInput label="Email" placeholder="email@gmail.com" onChange={(e) => {
                            setPostInputs(c => ({
                                ...c,
                                email: e.target.value,
                            }))
                        }}></LabelledInput>
                    </div>

                    <div className="mt-5">
                        <LabelledInput label="Password" type={"password"} placeholder="123..." onChange={(e) => {
                            setPostInputs(c => ({
                                ...c,
                                password: e.target.value
                            }))
                        }}></LabelledInput>
                    </div>

                    <div className="pt-8">
                        <button onClick={sendRequest} type="button" className="  w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type == "signup" ? "Sign up" : "Sign in"}</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return <div>
        <div>
            <label className="block mb-2 text-sm font-bold text-black">{label}</label>
            <input onChange={onChange} type={type || "text"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
        </div>
    </div>
}